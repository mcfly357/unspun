export const TOPICS = [
  { value: "politics", label: "Politics" },
  { value: "world", label: "World" },
  { value: "economy", label: "Economy" },
  { value: "science-tech", label: "Science & Tech" },
  { value: "other", label: "Other" },
] as const;

export type Topic = (typeof TOPICS)[number]["value"];

export const TOPIC_VALUES = TOPICS.map((t) => t.value);

export function topicLabel(value: string): string {
  return TOPICS.find((t) => t.value === value)?.label ?? "Other";
}
