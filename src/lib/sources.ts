// Server-only. The "lean" tag is used exclusively to compute a diversity
// score (how many distinct viewpoints covered a story) — it is never
// returned from an API route or rendered in the UI. Readers should never
// be able to tell which outlets fed a given story.
//
// "region" is the outlet's country/org of origin (see src/lib/regions.ts),
// used to compute each story's region so the feed can default to US
// coverage without a handful of high-volume international feeds (looking
// at you, Indian Express) crowding it out.
//
// Curation rule: one feed per organization. Stacking multiple feeds from
// the same publisher (e.g. several separate WSJ desks) would inflate the
// "independent sources" count without actually adding independent
// viewpoints, which undermines the point of that metric.
//
// Lean classifications are rough judgment calls, not a rigorous rating —
// treat them as a diversity signal, not a verdict. International public
// broadcasters and specialist tech/science outlets without a clear
// US-partisan lean default to "center".

import type { Region } from "./regions";

export type Lean = "left" | "center-left" | "center" | "center-right" | "right";

export interface SourceDef {
  name: string;
  feedUrl: string;
  lean: Lean;
  region: Region;
}

export const SOURCES: SourceDef[] = [
  // left
  { name: "HuffPost", feedUrl: "https://www.huffpost.com/section/front-page/feed", lean: "left", region: "us" },
  { name: "The Guardian (US)", feedUrl: "https://www.theguardian.com/us/rss", lean: "left", region: "uk" },
  { name: "The New York Times", feedUrl: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml", lean: "left", region: "us" },
  { name: "Los Angeles Times", feedUrl: "https://www.latimes.com/nation/rss2.0.xml", lean: "left", region: "us" },
  { name: "The Atlantic", feedUrl: "https://www.theatlantic.com/feed/all", lean: "left", region: "us" },
  { name: "The New Yorker", feedUrl: "https://www.newyorker.com/feed/rss", lean: "left", region: "us" },
  { name: "Vox", feedUrl: "https://www.vox.com/rss/index.xml", lean: "left", region: "us" },
  { name: "The Intercept", feedUrl: "https://theintercept.com/feed/?lang=en", lean: "left", region: "us" },
  { name: "Salon", feedUrl: "https://www.salon.com/feed", lean: "left", region: "us" },

  // center-left
  { name: "NBC News", feedUrl: "https://feeds.nbcnews.com/nbcnews/public/news", lean: "center-left", region: "us" },
  { name: "CNN", feedUrl: "http://rss.cnn.com/rss/cnn_topstories.rss", lean: "center-left", region: "us" },
  { name: "ABC News", feedUrl: "https://feeds.abcnews.com/abcnews/topstories", lean: "center-left", region: "us" },
  { name: "CBS News", feedUrl: "https://www.cbsnews.com/latest/rss/main", lean: "center-left", region: "us" },
  { name: "ProPublica", feedUrl: "https://www.propublica.org/feeds/propublica/main", lean: "center-left", region: "us" },
  { name: "Al Jazeera English", feedUrl: "https://www.aljazeera.com/xml/rss/all.xml", lean: "center-left", region: "middle-east" },
  { name: "CBC News", feedUrl: "https://www.cbc.ca/webfeed/rss/rss-topstories", lean: "center-left", region: "canada" },
  { name: "The Hindu", feedUrl: "https://www.thehindu.com/news/national/feeder/default.rss", lean: "center-left", region: "india" },

  // center / wire services / international public broadcasters / specialist outlets
  { name: "BBC News", feedUrl: "http://feeds.bbci.co.uk/news/rss.xml", lean: "center", region: "uk" },
  { name: "NPR", feedUrl: "https://feeds.npr.org/1001/rss.xml", lean: "center", region: "us" },
  { name: "UPI", feedUrl: "https://rss.upi.com/news/tn_us.rss", lean: "center", region: "us" },
  { name: "Newsweek", feedUrl: "https://www.newsweek.com/rss", lean: "center", region: "us" },
  { name: "Politico", feedUrl: "https://rss.politico.com/politics-news.xml", lean: "center", region: "us" },
  { name: "Axios", feedUrl: "https://api.axios.com/feed", lean: "center", region: "us" },
  { name: "Semafor", feedUrl: "https://www.semafor.com/rss.xml", lean: "center", region: "us" },
  { name: "Sky News", feedUrl: "https://feeds.skynews.com/feeds/rss/home.xml", lean: "center", region: "uk" },
  { name: "Deutsche Welle", feedUrl: "https://rss.dw.com/rdf/rss-en-all", lean: "center", region: "europe" },
  { name: "France 24", feedUrl: "https://www.france24.com/en/rss", lean: "center", region: "europe" },
  { name: "ABC Australia", feedUrl: "https://www.abc.net.au/news/feed/51120/rss.xml", lean: "center", region: "australia" },
  { name: "Times of India", feedUrl: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", lean: "center", region: "india" },
  { name: "Indian Express", feedUrl: "https://indianexpress.com/feed/", lean: "center", region: "india" },
  { name: "Bloomberg", feedUrl: "https://feeds.bloomberg.com/technology/news.rss", lean: "center", region: "us" },
  { name: "WIRED", feedUrl: "https://www.wired.com/feed/rss", lean: "center", region: "us" },
  { name: "The Verge", feedUrl: "https://www.theverge.com/rss/index.xml", lean: "center", region: "us" },
  { name: "Ars Technica", feedUrl: "https://feeds.arstechnica.com/arstechnica/index", lean: "center", region: "us" },
  { name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/", lean: "center", region: "us" },
  { name: "Engadget", feedUrl: "https://www.engadget.com/rss.xml", lean: "center", region: "us" },
  { name: "MIT Technology Review", feedUrl: "https://www.technologyreview.com/feed/", lean: "center", region: "us" },
  { name: "Nature", feedUrl: "https://www.nature.com/nature.rss", lean: "center", region: "uk" },
  { name: "404 Media", feedUrl: "https://www.404media.co/rss/", lean: "center", region: "us" },

  // center-right
  { name: "Washington Examiner", feedUrl: "https://www.washingtonexaminer.com/feed", lean: "center-right", region: "us" },
  { name: "The Wall Street Journal", feedUrl: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews", lean: "center-right", region: "us" },
  { name: "RealClearPolitics", feedUrl: "https://www.realclearpolitics.com/index.xml", lean: "center-right", region: "us" },

  // right
  { name: "Fox News", feedUrl: "https://moxie.foxnews.com/google-publisher/latest.xml", lean: "right", region: "us" },
  { name: "New York Post", feedUrl: "https://nypost.com/feed/", lean: "right", region: "us" },
  { name: "National Review", feedUrl: "https://www.nationalreview.com/feed/", lean: "right", region: "us" },
  { name: "Breitbart", feedUrl: "https://feeds.feedburner.com/breitbart", lean: "right", region: "us" },
  { name: "The Daily Wire", feedUrl: "https://www.dailywire.com/feeds/rss.xml", lean: "right", region: "us" },
];

export const LEAN_BUCKETS: Lean[] = ["left", "center-left", "center", "center-right", "right"];
