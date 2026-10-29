import { fetchAllFeeds } from "./fetchFeeds";
import { clusterNewArticles, getClustersReadyForSynthesis } from "./cluster";
import { synthesizeCluster } from "./synthesize";
import { LEAN_BUCKETS } from "./sources";
import { findTopicImage } from "./unsplash";
import { prisma } from "./db";

export interface PipelineResult {
  fetch: { source: string; ok: boolean; itemsNew: number; itemsSeen: number; error?: string }[];
  clustersAssigned: number;
  clustersCreated: number;
  storiesSynthesized: { headline: string; generatedBy: string; hasPhoto: boolean }[];
}

/** Fetch -> cluster -> synthesize -> image. Shared by the CLI script and the Vercel Cron route. */
export async function runPipeline(): Promise<PipelineResult> {
  const fetchResults = await fetchAllFeeds();
  const { assigned, created } = await clusterNewArticles();
  const ready = await getClustersReadyForSynthesis();

  const storiesSynthesized: PipelineResult["storiesSynthesized"] = [];

  for (const cluster of ready) {
    const snippets = cluster.articles.map((a) => ({ title: a.title, description: a.description }));
    const leans = new Set(cluster.articles.map((a) => a.source.lean));
    const leanDiversity = LEAN_BUCKETS.filter((l) => leans.has(l)).length;

    const synthesis = await synthesizeCluster(snippets);
    const image = await findTopicImage(synthesis.imageQuery);

    await prisma.synthesizedStory.create({
      data: {
        clusterId: cluster.id,
        headline: synthesis.headline,
        summary: synthesis.summary,
        keyFacts: JSON.stringify(synthesis.keyFacts),
        disputedClaims: JSON.stringify(synthesis.disputedClaims),
        unconfirmed: JSON.stringify(synthesis.unconfirmed),
        topic: synthesis.topic,
        sourceCount: new Set(cluster.articles.map((a) => a.sourceId)).size,
        leanDiversity,
        generatedBy: synthesis.generatedBy,
        imageUrl: image?.url,
        imagePhotographer: image?.photographerName,
        imagePhotographerUrl: image?.photographerUrl,
        imageSource: image ? "unsplash" : "none",
      },
    });

    storiesSynthesized.push({
      headline: synthesis.headline,
      generatedBy: synthesis.generatedBy,
      hasPhoto: !!image,
    });
  }

  return {
    fetch: fetchResults.map((r) => ({
      source: r.source,
      ok: r.ok,
      itemsNew: r.itemsNew,
      itemsSeen: r.itemsSeen,
      error: r.error,
    })),
    clustersAssigned: assigned,
    clustersCreated: created,
    storiesSynthesized,
  };
}
