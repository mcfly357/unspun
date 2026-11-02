import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { topicLabel } from "@/lib/topics";
import { regionLabel } from "@/lib/regions";
import { getStoryStatus } from "@/lib/storyStatus";
import { StatusBadge } from "@/components/StatusBadge";
import { StoryImage } from "@/components/StoryImage";
import { ReadingModeToggle } from "@/components/ReadingMode";
import { FeedFilters } from "@/components/FeedFilters";

export const dynamic = "force-dynamic";

type StoryRow = Awaited<ReturnType<typeof prisma.synthesizedStory.findMany>>[number];

function parsed(story: StoryRow) {
  return {
    ...story,
    keyFacts: JSON.parse(story.keyFacts) as string[],
    disputedClaims: JSON.parse(story.disputedClaims) as string[],
    unconfirmed: JSON.parse(story.unconfirmed) as string[],
  };
}

function FeaturedCard({ story }: { story: ReturnType<typeof parsed> }) {
  const status = getStoryStatus(story);
  return (
    <Link
      href={`/story/${story.id}`}
      className="group block rounded-2xl border border-rule bg-paper-raised overflow-hidden shadow-card transition-all hover:shadow-card-hover"
    >
      <StoryImage
        topic={story.topic}
        className="h-48 sm:h-64"
        imageUrl={story.imageUrl}
        imagePhotographer={story.imagePhotographer}
        imagePhotographerUrl={story.imagePhotographerUrl}
        linked={false}
      />
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {topicLabel(story.topic)}
          </span>
          <StatusBadge status={status} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold leading-snug group-hover:text-accent transition-colors">
          {story.headline}
        </h2>
        <p className="mt-2 text-ink-soft leading-relaxed">{story.summary.split("\n")[0].slice(0, 180)}</p>

        <div className="mt-5 border-t border-rule pt-4 space-y-2 font-sans text-sm">
          {story.keyFacts[0] && (
            <p>
              <span className="font-semibold text-ink">What we know&ensp;</span>
              <span className="text-ink-soft">{story.keyFacts[0]}</span>
            </p>
          )}
          {story.unconfirmed[0] && (
            <p>
              <span className="font-semibold text-ink">What&rsquo;s still unknown&ensp;</span>
              <span className="text-ink-soft">{story.unconfirmed[0]}</span>
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between font-sans text-sm">
          <span className="text-ink-soft">{story.sourceCount} reports compared</span>
          <span className="text-accent font-semibold">View evidence &rarr;</span>
        </div>
      </div>
    </Link>
  );
}

function StoryCard({ story }: { story: ReturnType<typeof parsed> }) {
  const status = getStoryStatus(story);
  return (
    <Link
      href={`/story/${story.id}`}
      className="group block rounded-2xl border border-rule bg-paper-raised overflow-hidden shadow-card transition-all hover:shadow-card-hover hover:-translate-y-0.5"
    >
      <StoryImage
        topic={story.topic}
        className="h-32"
        imageUrl={story.imageUrl}
        imagePhotographer={story.imagePhotographer}
        imagePhotographerUrl={story.imagePhotographerUrl}
        linked={false}
      />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {topicLabel(story.topic)}
          </span>
          <StatusBadge status={status} />
        </div>
        <h3 className="text-lg font-bold leading-snug group-hover:text-accent transition-colors">
          {story.headline}
        </h3>
      </div>
    </Link>
  );
}

function WorldHighlights({ stories }: { stories: ReturnType<typeof parsed>[] }) {
  if (stories.length === 0) return null;
  return (
    <div className="rounded-2xl border border-rule bg-paper-raised p-5 shadow-card mb-8">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-sans text-sm font-bold text-ink">World highlights</h2>
        <Link href="/?region=all" className="font-sans text-xs text-accent hover:underline shrink-0">
          See everything &rarr;
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/story/${story.id}`}
            className="group block w-56 shrink-0 rounded-xl border border-rule overflow-hidden hover:shadow-card-hover transition-shadow"
          >
            <StoryImage
              topic={story.topic}
              className="h-24"
              imageUrl={story.imageUrl}
              imagePhotographer={story.imagePhotographer}
              imagePhotographerUrl={story.imagePhotographerUrl}
              linked={false}
            />
            <div className="p-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                {regionLabel(story.region)}
              </span>
              <p className="text-sm font-semibold leading-snug mt-0.5 group-hover:text-accent transition-colors">
                {story.headline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface FeedPageProps {
  searchParams: { topic?: string; region?: string; status?: string };
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const { topic, region, status } = searchParams;

  const baseWhere: Record<string, unknown> = {};
  if (topic) baseWhere.topic = topic;
  if (status) baseWhere.status = status;

  let rows: StoryRow[];
  let worldHighlightRows: StoryRow[] = [];
  const isDefaultRegionMode = !region;

  if (isDefaultRegionMode) {
    [rows, worldHighlightRows] = await Promise.all([
      prisma.synthesizedStory.findMany({
        where: { ...baseWhere, region: "us" },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.synthesizedStory.findMany({
        where: { ...baseWhere, region: { not: "us" } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);
  } else {
    rows = await prisma.synthesizedStory.findMany({
      where: region === "all" ? baseWhere : { ...baseWhere, region },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  const stories = rows.map(parsed);
  const worldHighlights = worldHighlightRows.map(parsed);
  const [featured, ...rest] = stories;

  return (
    <>
      <section className="border-b border-rule bg-paper">
        <div className="max-w-6xl mx-auto px-6 pt-14 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Less spin. More understanding.
          </h1>
          <p className="mt-3 font-sans text-ink-soft text-lg">
            The news, checked against the evidence. Not your politics.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pt-6">
        <Suspense fallback={null}>
          <FeedFilters />
        </Suspense>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {isDefaultRegionMode && <WorldHighlights stories={worldHighlights} />}

        {stories.length === 0 ? (
          <div className="text-ink-soft font-sans">
            <p className="mb-4">
              {topic || region || status ? "No stories match these filters yet." : "No synthesized stories yet."}
            </p>
            <p className="text-sm">Run the pipeline to fetch feeds, cluster coverage, and synthesize stories:</p>
            <pre className="bg-neutral-100 border border-rule rounded-lg p-3 mt-2 text-xs overflow-x-auto">
              npm run pipeline
            </pre>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <div>
              <FeaturedCard story={featured} />
              {rest.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-5 mt-6">
                  {rest.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-rule bg-paper-raised p-5 shadow-card">
                <h2 className="text-lg font-bold mb-3">The evidence, not the echo</h2>
                <ol className="space-y-2 font-sans text-sm text-ink-soft">
                  <li className="flex gap-2">
                    <span className="font-semibold text-ink">1.</span> Compare reporting across outlets
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-ink">2.</span> Keep only corroborated claims
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-ink">3.</span> Flag what&rsquo;s disputed or unconfirmed
                  </li>
                </ol>
                <Link
                  href="/how-it-works"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-accent text-accent font-sans text-sm font-semibold py-2 hover:bg-accent-soft transition-colors"
                >
                  Explore our process
                </Link>
              </div>

              <div className="rounded-2xl border border-rule bg-paper-raised p-5 shadow-card">
                <h2 className="font-sans text-sm font-bold text-ink mb-3">Your reading mode</h2>
                <ReadingModeToggle />
              </div>

              <div className="rounded-2xl border border-rule bg-paper-raised p-5 shadow-card">
                <h2 className="font-sans text-sm font-bold text-ink mb-3">What our labels mean</h2>
                <ul className="space-y-2 font-sans text-xs text-ink-soft">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>
                      <span className="font-semibold text-ink">Evidence reviewed</span> — corroborated across
                      sources
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span>
                      <span className="font-semibold text-ink">Claims disputed</span> — sources disagree on
                      facts
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neutral-400" />
                    <span>
                      <span className="font-semibold text-ink">Partially verified</span> — some details
                      unconfirmed
                    </span>
                  </li>
                </ul>
                <p className="mt-3 text-[11px] text-ink-soft font-sans">
                  Labels are evidence-based. They do not reflect a political leaning.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
