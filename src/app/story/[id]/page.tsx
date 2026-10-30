import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { topicLabel } from "@/lib/topics";
import { getStoryStatus } from "@/lib/storyStatus";
import { StatusBadge } from "@/components/StatusBadge";
import { SourceReveal } from "@/components/SourceReveal";
import { StoryImage } from "@/components/StoryImage";

export const dynamic = "force-dynamic";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans inline-flex items-center rounded-full bg-neutral-100 text-ink-soft px-2.5 py-1 text-[11px] font-semibold">
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft mb-3">
      {children}
    </h2>
  );
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await prisma.synthesizedStory.findUnique({
    where: { id: params.id },
    include: { cluster: { include: { articles: { include: { source: true } } } } },
  });
  if (!story) notFound();

  const keyFacts: string[] = JSON.parse(story.keyFacts);
  const disputedClaims: string[] = JSON.parse(story.disputedClaims);
  const unconfirmed: string[] = JSON.parse(story.unconfirmed);
  const sourceNames = Array.from(new Set(story.cluster.articles.map((a) => a.source.name))).sort();
  const reporterNames = Array.from(
    new Set(story.cluster.articles.map((a) => a.reporter).filter((r): r is string => !!r))
  ).sort();
  const status = getStoryStatus({ disputedClaims, unconfirmed });

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <article>
        <Link
          href="/"
          className="font-sans inline-flex items-center gap-1 text-sm text-ink-soft hover:text-accent transition-colors"
        >
          &larr; back to feed
        </Link>

        <div className="flex items-center gap-3 mt-6">
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft">
            {topicLabel(story.topic)}
          </span>
          <StatusBadge status={status} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold mt-3 leading-tight">{story.headline}</h1>

        {reporterNames.length > 0 && (
          <p className="font-sans text-sm text-ink-soft mt-2">
            By {reporterNames.join(", ")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Pill>{story.sourceCount} independent sources</Pill>
          <Pill>viewpoint diversity {story.leanDiversity}/5</Pill>
        </div>

        <div className="mt-4">
          <SourceReveal sourceNames={sourceNames} />
        </div>

        <StoryImage
          topic={story.topic}
          className="mt-6 h-64 sm:h-80 rounded-xl"
          imageUrl={story.imageUrl}
          imagePhotographer={story.imagePhotographer}
          imagePhotographerUrl={story.imagePhotographerUrl}
        />

        <div className="mt-8 text-lg leading-relaxed whitespace-pre-line text-ink">{story.summary}</div>

        {keyFacts.length > 0 && (
          <section className="mt-10">
            <SectionLabel>Corroborated facts</SectionLabel>
            <ul className="space-y-2">
              {keyFacts.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-soft" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {disputedClaims.length > 0 && (
          <section className="mt-8 rounded-xl border-l-4 border-accent bg-accent-soft/60 p-5">
            <SectionLabel>Where sources disagree</SectionLabel>
            <ul className="space-y-2">
              {disputedClaims.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {unconfirmed.length > 0 && (
          <section className="mt-8 rounded-xl border-l-4 border-neutral-300 bg-neutral-50 p-5">
            <SectionLabel>Reported by only one source (unconfirmed)</SectionLabel>
            <ul className="space-y-2 text-ink-soft">
              {unconfirmed.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
