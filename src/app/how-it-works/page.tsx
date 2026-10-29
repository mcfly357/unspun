import Link from "next/link";

export const metadata = { title: "How we verify — Unspun" };

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 h-9 w-9 rounded-full bg-accent-soft text-accent font-sans font-bold flex items-center justify-center">
        {n}
      </div>
      <div>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-ink-soft mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link href="/" className="font-sans text-sm text-ink-soft hover:text-accent transition-colors">
        &larr; back to feed
      </Link>

      <h1 className="text-4xl font-bold mt-5">The evidence, not the echo</h1>
      <p className="mt-3 text-lg text-ink-soft leading-relaxed">
        Unspun doesn&rsquo;t employ reporters. It reads what outlets across the political spectrum
        already published, and reports back only what they agree actually happened.
      </p>

      <div className="mt-10 space-y-8">
        <Step
          n={1}
          title="Compare reporting"
          body="We pull headlines and summaries from outlets spanning left, center, and right, and group the ones covering the same real-world event."
        />
        <Step
          n={2}
          title="Check what's corroborated"
          body="An independent pass identifies which specific claims are backed by multiple outlets, versus claims only one outlet is making."
        />
        <Step
          n={3}
          title="Separate fact from disputed framing"
          body="Claims every source agrees on become the story. Claims sources disagree on are shown as disputes, not resolved in either direction. Claims only one source reports are labeled unconfirmed, not folded into the summary as fact."
        />
      </div>

      <div className="mt-10 rounded-xl border border-rule bg-paper-raised p-5">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-ink-soft mb-2">
          Why we hide outlet names
        </h2>
        <p className="text-ink-soft leading-relaxed">
          Knowing a story came from a left- or right-leaning outlet changes how people read it before
          they&rsquo;ve read a single word. Unspun withholds that by default so the claims get judged on
          their own evidence. You can still reveal which outlets contributed to any story &mdash; after
          you&rsquo;ve read it &mdash; from the story page or your reading-mode setting.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-rule bg-paper-raised p-5">
        <h2 className="font-sans text-sm font-bold uppercase tracking-wide text-ink-soft mb-2">
          Limitations, honestly
        </h2>
        <ul className="text-ink-soft leading-relaxed list-disc list-inside space-y-1">
          <li>Grouping stories by the same event is automated and imperfect.</li>
          <li>A story only gets synthesized once enough independent outlets cover it.</li>
          <li>The outlet list is a judgment call about what counts as a reasonable spread of viewpoints.</li>
        </ul>
      </div>
    </div>
  );
}
