export const REGIONS = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "australia", label: "Australia" },
  { value: "india", label: "India" },
  { value: "europe", label: "Europe" },
  { value: "middle-east", label: "Middle East" },
  { value: "international", label: "International" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];

export const REGION_VALUES = REGIONS.map((r) => r.value);

export function regionLabel(value: string): string {
  return REGIONS.find((r) => r.value === value)?.label ?? "International";
}

/** Majority region among a set of contributing sources, "us" winning ties
 * (the default audience) — falls back to "international" when there's no
 * single clear majority at all. */
export function majorityRegion(sourceRegions: string[]): Region {
  if (sourceRegions.length === 0) return "international";

  const counts = new Map<string, number>();
  for (const r of sourceRegions) counts.set(r, (counts.get(r) ?? 0) + 1);

  let best: string = "international";
  let bestCount = 0;
  for (const [region, count] of counts) {
    if (count > bestCount || (count === bestCount && region === "us")) {
      best = region;
      bestCount = count;
    }
  }

  return (REGION_VALUES as readonly string[]).includes(best) ? (best as Region) : "international";
}
