// Server-only. The "lean" tag is used exclusively to compute a diversity
// score (how many distinct viewpoints covered a story) — it is never
// returned from an API route or rendered in the UI. Readers should never
// be able to tell which outlets fed a given story.

export type Lean = "left" | "center-left" | "center" | "center-right" | "right";

export interface SourceDef {
  name: string;
  feedUrl: string;
  lean: Lean;
}

export const SOURCES: SourceDef[] = [
  // left
  { name: "HuffPost", feedUrl: "https://www.huffpost.com/section/front-page/feed", lean: "left" },
  { name: "The Guardian (US)", feedUrl: "https://www.theguardian.com/us/rss", lean: "left" },

  // center-left
  { name: "NBC News", feedUrl: "https://feeds.nbcnews.com/nbcnews/public/news", lean: "center-left" },
  { name: "CNN", feedUrl: "http://rss.cnn.com/rss/cnn_topstories.rss", lean: "center-left" },

  // center / wire services
  { name: "BBC News", feedUrl: "http://feeds.bbci.co.uk/news/rss.xml", lean: "center" },
  { name: "NPR", feedUrl: "https://feeds.npr.org/1001/rss.xml", lean: "center" },

  // center-right
  { name: "Washington Examiner", feedUrl: "https://www.washingtonexaminer.com/feed", lean: "center-right" },

  // right
  { name: "Fox News", feedUrl: "https://moxie.foxnews.com/google-publisher/latest.xml", lean: "right" },
  { name: "New York Post", feedUrl: "https://nypost.com/feed/", lean: "right" },
  { name: "National Review", feedUrl: "https://www.nationalreview.com/feed/", lean: "right" },
];

export const LEAN_BUCKETS: Lean[] = ["left", "center-left", "center", "center-right", "right"];
