import Anthropic from "@anthropic-ai/sdk";
import { TOPIC_VALUES, type Topic, topicLabel } from "./topics";

export interface SourceSnippet {
  title: string;
  description: string | null;
}

export interface Synthesis {
  headline: string;
  summary: string;
  keyFacts: string[];
  disputedClaims: string[];
  unconfirmed: string[];
  topic: Topic;
  imageQuery: string;
  generatedBy: "claude" | "fallback-extractive";
}

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5";

const SYNTHESIS_TOOL: Anthropic.Tool = {
  name: "submit_synthesis",
  description: "Submit the neutral, fact-checked synthesis of a news story.",
  input_schema: {
    type: "object",
    properties: {
      headline: { type: "string", description: "A neutral, non-sensational headline." },
      summary: {
        type: "string",
        description: "2-4 neutral paragraphs describing what happened, sticking to facts corroborated by multiple sources. No editorializing, no loaded language, no speculation about motives.",
      },
      keyFacts: {
        type: "array",
        items: { type: "string" },
        description: "Short bullet-point facts that are corroborated by multiple sources.",
      },
      disputedClaims: {
        type: "array",
        items: { type: "string" },
        description: "Claims where sources genuinely disagree on the facts (not framing) — describe the disagreement itself, neutrally.",
      },
      unconfirmed: {
        type: "array",
        items: { type: "string" },
        description: "Claims reported by only a single source that the others did not corroborate.",
      },
      topic: {
        type: "string",
        enum: TOPIC_VALUES,
        description: "The single best-fitting topic category for this story.",
      },
      imageQuery: {
        type: "string",
        description:
          "A 2-4 word generic stock-photo search term capturing the general subject matter (e.g. 'courtroom gavel', 'stock market screens', 'hospital corridor', 'baseball stadium'). Must be generic enough that the photo could not be mistaken for actual footage of this event — never name the specific people, exact location, or anything unique to this story.",
      },
    },
    required: ["headline", "summary", "keyFacts", "disputedClaims", "unconfirmed", "topic", "imageQuery"],
  },
};

const SYSTEM_PROMPT = `You are a neutral fact-synthesis engine for a news aggregator whose entire purpose is to strip out partisan framing and let readers see only what is actually known.

You will be given several anonymized headline+snippet pairs, each from a different outlet, about the same real-world event. The outlets are NOT identified and you must not guess or mention them.

Your job:
1. Identify the facts that are corroborated across multiple snippets — report only those as "key facts".
2. Write a short neutral summary using plain, non-emotive language. Strip loaded adjectives, framing, and speculation about motive or intent. Report actions and verified outcomes, not characterizations.
3. If snippets conflict on a factual point (e.g. different casualty counts, different quotes), list it under disputedClaims and describe the disagreement itself instead of picking a side.
4. If a claim appears in only one snippet, list it under unconfirmed rather than folding it into the main summary.
5. Never mention outlet names, political leanings, or which snippet a fact came from.
6. Classify the story into the single best-fitting topic category.
7. Suggest a generic stock-photo search term for a purely decorative header image — it must not depict or imply the actual event, people, or location.

Call the submit_synthesis tool with your result.`;

function buildUserPrompt(snippets: SourceSnippet[]): string {
  return snippets
    .map((s, i) => `Snippet ${i + 1}:\nTitle: ${s.title}\nDetails: ${s.description ?? "(none)"}`)
    .join("\n\n");
}

/** Simple, deterministic, no-API-key fallback so the pipeline is runnable immediately. */
function fallbackSynthesize(snippets: SourceSnippet[]): Synthesis {
  const titles = Array.from(new Set(snippets.map((s) => s.title.trim())));
  return {
    headline: titles[0] ?? "Developing story",
    summary:
      `This is a placeholder synthesis generated without an LLM (no ANTHROPIC_API_KEY configured). ` +
      `${snippets.length} independent sources covered this event. Raw reported headlines:\n` +
      titles.map((t) => `- ${t}`).join("\n"),
    keyFacts: titles,
    disputedClaims: [],
    unconfirmed: [],
    topic: "other",
    imageQuery: "newspaper",
    generatedBy: "fallback-extractive",
  };
}

export async function synthesizeCluster(snippets: SourceSnippet[]): Promise<Synthesis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return fallbackSynthesize(snippets);
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [SYNTHESIS_TOOL],
    tool_choice: { type: "tool", name: "submit_synthesis" },
    messages: [{ role: "user", content: buildUserPrompt(snippets) }],
  });

  const toolUse = message.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    return fallbackSynthesize(snippets);
  }

  const input = toolUse.input as Partial<{
    headline: string;
    summary: string;
    keyFacts: unknown;
    disputedClaims: unknown;
    unconfirmed: unknown;
    topic: unknown;
    imageQuery: unknown;
  }>;

  // The model sometimes renders a list field as a single string of
  // "<item>...</item>" tags (or plain newline-separated bullets) instead of
  // a real JSON array, despite the schema. Coerce rather than reject so a
  // harmless formatting quirk doesn't fall all the way back to no-LLM mode.
  function toStringArray(v: unknown): string[] {
    if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
    if (typeof v !== "string") return [];
    const tagMatches = [...v.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1].trim());
    if (tagMatches.length > 0) return tagMatches.filter(Boolean);
    return v
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);
  }

  if (
    message.stop_reason === "max_tokens" ||
    typeof input.headline !== "string" ||
    typeof input.summary !== "string"
  ) {
    console.warn("  (malformed or truncated LLM output for a cluster — using fallback synthesis)");
    return fallbackSynthesize(snippets);
  }

  const topic: Topic = TOPIC_VALUES.includes(input.topic as Topic) ? (input.topic as Topic) : "other";
  const imageQuery = typeof input.imageQuery === "string" && input.imageQuery.trim() ? input.imageQuery.trim() : topicLabel(topic);

  return {
    headline: input.headline,
    summary: input.summary,
    keyFacts: toStringArray(input.keyFacts),
    disputedClaims: toStringArray(input.disputedClaims),
    unconfirmed: toStringArray(input.unconfirmed),
    topic,
    imageQuery,
    generatedBy: "claude",
  };
}
