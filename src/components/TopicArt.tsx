import type { Topic } from "@/lib/topics";

const GRADIENTS: Record<Topic, string> = {
  politics: "from-slate-200 via-slate-100 to-stone-100",
  world: "from-sky-200 via-sky-100 to-stone-100",
  economy: "from-amber-200 via-amber-100 to-stone-100",
  "science-tech": "from-violet-200 via-violet-100 to-stone-100",
  other: "from-neutral-200 via-neutral-100 to-stone-100",
};

/** Abstract, topic-tinted texture used in place of a real photo — avoids any
 * provenance/copyright question and keeps every card visually consistent. */
export function TopicArt({ topic, className = "" }: { topic: string; className?: string }) {
  const gradient = GRADIENTS[topic as Topic] ?? GRADIENTS.other;
  const patternId = `ring-pattern-${topic}`;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
            <circle cx="36" cy="36" r="22" fill="none" stroke="#16181c" strokeWidth="2.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
