export type StoryStatus = {
  label: string;
  tone: "supported" | "disputed" | "unverified";
};

/** A single headline status derived from what the synthesis actually found. */
export function getStoryStatus(story: { disputedClaims: string[]; unconfirmed: string[] }): StoryStatus {
  if (story.disputedClaims.length > 0) return { label: "Claims disputed", tone: "disputed" };
  if (story.unconfirmed.length > 0) return { label: "Partially verified", tone: "unverified" };
  return { label: "Evidence reviewed", tone: "supported" };
}
