# Unspun

A news aggregator that pulls coverage of the same event from a politically
diverse set of outlets, strips out source identity and framing, and
publishes only what's corroborated across sources — flagging disputed or
single-source claims rather than presenting them as fact.

## How it works

1. **Fetch** — `src/lib/fetchFeeds.ts` pulls RSS headlines/snippets from the
   outlets listed in `src/lib/sources.ts` (tagged left/center/right
   internally, purely to measure viewpoint diversity — never shown to readers).
2. **Cluster** — `src/lib/cluster.ts` groups articles published within a
   rolling 72-hour window that are likely about the same event, using
   keyword overlap on titles.
3. **Synthesize** — once a cluster has coverage from at least 3 independent
   outlets, `src/lib/synthesize.ts` sends anonymized title+snippet pairs
   (no outlet names) to Claude, which returns a neutral summary, a list of
   corroborated key facts, any claims where sources factually disagree, and
   any claims only one source reported. Without an `ANTHROPIC_API_KEY` it
   falls back to a basic non-LLM placeholder so the whole pipeline still
   runs end to end.
4. **Serve** — the Next.js app reads only the `SynthesizedStory` table.
   Nothing about which outlets contributed is ever exposed via the API or
   UI.

## Setup

```bash
npm install
cp .env.example .env
npm run db:push     # creates the local SQLite database
npm run pipeline     # fetch + cluster + synthesize once
npm run dev           # http://localhost:3000
```

To get real (non-placeholder) synthesis, add an Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get one at https://console.anthropic.com/. Each pipeline run costs roughly
one Claude call per new story cluster — cheap at this scale, but keep an
eye on usage if you schedule it frequently.

## Running it on a schedule

For local development, just re-run `npm run pipeline` periodically (e.g. a
cron job calling `npm --prefix /path/to/news-aggregator run pipeline`).
When you deploy (e.g. to Vercel), wire the same script to Vercel Cron or
GitHub Actions on a schedule like every 30–60 minutes.

## Known limitations / next steps

- **RSS feed URLs drift.** Outlets change their feed paths periodically;
  check `src/lib/fetchFeeds.ts` output for `FAILED` sources and update
  `src/lib/sources.ts` as needed.
- **Clustering is keyword-based, not semantic.** It's cheap and has no
  dependencies, but it will miss stories where outlets use very different
  words for the same event, and can occasionally merge unrelated stories
  that share vocabulary. An embedding-based similarity step is the natural
  upgrade if this matters to you.
- **Source list diversity is a judgment call.** The left/center/right
  tagging in `src/lib/sources.ts` is inherently debatable — treat it as a
  rough diversity signal, not a rigorous classification, and feel free to
  adjust which outlets you trust enough to include.
- No images, no comments, no user accounts yet — this is a working
  prototype of the core pipeline and reading experience.
