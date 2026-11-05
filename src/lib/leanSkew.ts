import type { Lean } from "./sources";

export type LeanGroup = "left" | "center" | "right";

const GROUP_MAP: Record<Lean, LeanGroup> = {
  left: "left",
  "center-left": "left",
  center: "center",
  "center-right": "right",
  right: "right",
};

export const LEAN_GROUP_LABEL: Record<LeanGroup, string> = {
  left: "left-leaning",
  center: "center",
  right: "right-leaning",
};

export interface LeanBreakdown {
  left: number;
  center: number;
  right: number;
  /** Set when one group accounts for SKEW_THRESHOLD+ of sources (and there are enough sources to be meaningful). */
  skewedTo: LeanGroup | null;
}

const SKEW_THRESHOLD = 0.7;
const MIN_SOURCES_FOR_SKEW = 3;

/** One lean per independent source (dedupe before calling, so one outlet can't dominate the count). */
export function computeLeanBreakdown(leans: Lean[]): LeanBreakdown {
  const counts: Record<LeanGroup, number> = { left: 0, center: 0, right: 0 };
  for (const lean of leans) counts[GROUP_MAP[lean]]++;

  const total = leans.length;
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  let skewedTo: LeanGroup | null = null;
  if (total >= MIN_SOURCES_FOR_SKEW) {
    for (const group of ["left", "center", "right"] as LeanGroup[]) {
      if (counts[group] / total >= SKEW_THRESHOLD) {
        skewedTo = group;
        break;
      }
    }
  }

  return { left: pct(counts.left), center: pct(counts.center), right: pct(counts.right), skewedTo };
}
