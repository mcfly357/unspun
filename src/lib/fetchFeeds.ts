import Parser from "rss-parser";
import { prisma } from "./db";
import { SOURCES } from "./sources";

const parser = new Parser({
  timeout: 15_000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

/** rss-parser's own `timeout` doesn't always abort a hung connect/DNS phase,
 * so wrap it in a hard deadline too — one dead feed shouldn't stall the rest. */
function parseWithDeadline(url: string, ms: number) {
  return Promise.race([
    parser.parseURL(url),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// Feed "creator"/"author" fields sometimes hold a publication or wire-service
// name instead of a person (e.g. an NY Post item crediting "Fox News" for
// syndicated content). Since reporter names are shown by default — unlike
// outlet names, which stay hidden — a publication name leaking through here
// would defeat the whole point. Filter those out rather than trust the feed.
const NON_PERSON_BYLINES = new Set(
  [...SOURCES.map((s) => s.name), "Reuters", "Associated Press", "AP", "AFP", "Bloomberg", "Staff", "Editorial Staff", "Wire Reports", "News Desk", "Newsroom", "Staff Report", "Staff Reports"].map((s) =>
    s.toLowerCase()
  )
);

function sanitizeReporter(raw: string | undefined): string | null {
  if (!raw) return null;
  const name = raw.trim();
  if (!name) return null;
  if (NON_PERSON_BYLINES.has(name.toLowerCase())) return null;
  if (/\b(staff|desk|newsroom|wire|editorial)\b/i.test(name)) return null;
  return name.slice(0, 200);
}

export interface FetchSummary {
  source: string;
  ok: boolean;
  itemsSeen: number;
  itemsNew: number;
  error?: string;
}

/** Pulls every configured RSS feed and upserts (Source, Article) rows. */
export async function fetchAllFeeds(): Promise<FetchSummary[]> {
  const results: FetchSummary[] = [];

  for (const def of SOURCES) {
    const source = await prisma.source.upsert({
      where: { name: def.name },
      update: { feedUrl: def.feedUrl, lean: def.lean },
      create: { name: def.name, feedUrl: def.feedUrl, lean: def.lean },
    });

    try {
      const feed = await parseWithDeadline(def.feedUrl, 20_000);
      let itemsNew = 0;

      for (const item of feed.items) {
        if (!item.link || !item.title) continue;

        const publishedAt = item.isoDate ? new Date(item.isoDate) : new Date();

        const existing = await prisma.article.findUnique({ where: { link: item.link } });
        if (existing) continue;

        await prisma.article.create({
          data: {
            sourceId: source.id,
            title: item.title.trim(),
            link: item.link,
            description: (item.contentSnippet ?? item.summary ?? "").slice(0, 2000),
            reporter: sanitizeReporter(item.creator ?? item.author),
            publishedAt,
          },
        });
        itemsNew++;
      }

      results.push({ source: def.name, ok: true, itemsSeen: feed.items.length, itemsNew });
    } catch (err) {
      results.push({
        source: def.name,
        ok: false,
        itemsSeen: 0,
        itemsNew: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
