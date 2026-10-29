import type { StoryStatus } from "@/lib/storyStatus";

const TONE_CLASSES: Record<StoryStatus["tone"], string> = {
  supported: "bg-emerald-50 text-emerald-700",
  disputed: "bg-accent-soft text-accent",
  unverified: "bg-neutral-100 text-ink-soft",
};

const TONE_ICON: Record<StoryStatus["tone"], string> = {
  supported: "✓", // check
  disputed: "△", // triangle
  unverified: "○", // circle
};

export function StatusBadge({ status }: { status: StoryStatus }) {
  return (
    <span
      className={`font-sans inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE_CLASSES[status.tone]}`}
    >
      <span aria-hidden>{TONE_ICON[status.tone]}</span>
      {status.label}
    </span>
  );
}
