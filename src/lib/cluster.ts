import { prisma } from "./db";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "at", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "this", "that", "these", "those", "his", "her", "their", "our",
  "says", "said", "say", "after", "over", "about", "into", "than", "has",
  "have", "had", "will", "would", "could", "should", "amid", "new", "report",
  "reports", "news", "live", "update", "updates", "video",
]);

function keywords(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const SIMILARITY_THRESHOLD = 0.35;
const CLUSTER_WINDOW_HOURS = 72;

/**
 * Greedily assigns unclustered articles to existing open clusters (same
 * event, loosely matched on title keyword overlap), creating a fresh
 * cluster when nothing matches closely enough.
 */
export async function clusterNewArticles(): Promise<{ assigned: number; created: number }> {
  const windowStart = new Date(Date.now() - CLUSTER_WINDOW_HOURS * 60 * 60 * 1000);

  const openClusters = await prisma.storyCluster.findMany({
    where: { articles: { some: { publishedAt: { gte: windowStart } } } },
    include: { articles: true },
  });

  const clusterKeywordSets = openClusters.map((c) => ({
    cluster: c,
    keywordSets: c.articles.map((a) => keywords(a.title)),
  }));

  const unclustered = await prisma.article.findMany({
    where: { clusterId: null, publishedAt: { gte: windowStart } },
  });

  let assigned = 0;
  let created = 0;

  for (const article of unclustered) {
    const kw = keywords(article.title);

    let best: { clusterId: string; score: number } | null = null;
    for (const entry of clusterKeywordSets) {
      const score = Math.max(0, ...entry.keywordSets.map((s) => jaccard(kw, s)));
      if (score >= SIMILARITY_THRESHOLD && (!best || score > best.score)) {
        best = { clusterId: entry.cluster.id, score };
      }
    }

    if (best) {
      await prisma.article.update({ where: { id: article.id }, data: { clusterId: best.clusterId } });
      const entry = clusterKeywordSets.find((e) => e.cluster.id === best!.clusterId)!;
      entry.keywordSets.push(kw);
      assigned++;
    } else {
      const newCluster = await prisma.storyCluster.create({ data: {} });
      await prisma.article.update({ where: { id: article.id }, data: { clusterId: newCluster.id } });
      clusterKeywordSets.push({
        cluster: { ...newCluster, articles: [] },
        keywordSets: [kw],
      });
      created++;
    }
  }

  return { assigned, created };
}

// Lower bound on independent outlets before we'll publish a synthesis.
// 3 is the ideal (any single disagreement is outvoted); 2 is accepted for
// now given how few feeds reliably overlap on the same story in one pass —
// raise this back to 3 once the source list is larger.
export const MIN_SOURCES_TO_SYNTHESIZE = 2;

/** Clusters with enough independent sources and no synthesis yet. */
export async function getClustersReadyForSynthesis() {
  const clusters = await prisma.storyCluster.findMany({
    where: { story: null },
    include: { articles: { include: { source: true } } },
  });

  return clusters.filter((c) => {
    const distinctSources = new Set(c.articles.map((a) => a.sourceId));
    return distinctSources.size >= MIN_SOURCES_TO_SYNTHESIZE;
  });
}
