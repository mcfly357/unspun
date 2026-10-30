import { fetchAllFeeds } from "./fetchFeeds";
import { clusterNewArticles, getClustersReadyForSynthesis } from "./cluster";
import { synthesizeCluster } from "./synthesize";
import { LEAN_BUCKETS } from "./sources";
import { topicLabel } from "./topics";
import { findTopicImage } from "./unsplash";
import { prisma } from "./db";

export interface PipelineResult {
  fetch: { source: string; ok: boolean; itemsNew: number; itemsSeen: number; error?: string }[];
  clustersAssigned: number;
  clustersCreated: number;
  storiesSynthesized: { headline: string; generatedBy: string; hasPhoto: boolean }[];
  imagesBackfilled: number;
}

// Cap per run: the Unsplash free tier is 50 requests/hour shared with
// new-story image lookups, and this pipeline can run every 30 minutes —
// leave headroom rather than spend the whole budget on backfill.
const MAX_IMAGE_BACKFILL_PER_RUN = 10;

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

  // Retry images for older stories that missed one last time (e.g. an
  // Unsplash rate-limit hit). We don't persist the original per-story
  // imageQuery, so this falls back to the topic label — less specific,
  // but still far better than the permanent abstract-pattern fallback.
  const missingImages = await prisma.synthesizedStory.findMany({
    where: { imageSource: "none" },
    take: MAX_IMAGE_BACKFILL_PER_RUN,
  });

  let imagesBackfilled = 0;
  for (const story of missingImages) {
    const image = await findTopicImage(topicLabel(story.topic));
    if (!image) continue;
    await prisma.synthesizedStory.update({
      where: { id: story.id },
      data: {
        imageUrl: image.url,
        imagePhotographer: image.photographerName,
        imagePhotographerUrl: image.photographerUrl,
        imageSource: "unsplash",
      },
    });
    imagesBackfilled++;
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
    imagesBackfilled,
  };
}
