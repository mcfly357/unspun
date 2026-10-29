// Unsplash integration for decorative, topic-matched stock photos.
//
// Legal/compliance notes (see https://help.unsplash.com/en/articles/2511315):
// - Images are under the Unsplash License: free for commercial use, no
//   permission needed. We still attribute, because the API *Guidelines*
//   (separate from the license) require it for apps using the API.
// - Every photo we select is credited with a visible link to the
//   photographer and to Unsplash, both carrying UTM params per guideline.
// - Per the "Triggering a Download" guideline, we ping `download_location`
//   at the moment we select a photo for a story (the equivalent of
//   "inserting" it) — not on every page view.
// - These are generic topic photos, not photos of the actual news event.
//   The UI must never imply otherwise.

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const APP_NAME = "unspun-news-aggregator";

export interface StoryImage {
  url: string;
  photographerName: string;
  photographerUrl: string;
}

interface UnsplashPhoto {
  urls: { regular: string };
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

function withUtm(url: string): string {
  const u = new URL(url);
  u.searchParams.set("utm_source", APP_NAME);
  u.searchParams.set("utm_medium", "referral");
  return u.toString();
}

/** Searches for one topic-relevant photo and pings the required download-tracking endpoint.
 * Picks randomly among the top results (rather than always the #1 match) so that stories
 * sharing a query — e.g. two stories both landing in the same topic bucket — don't all end
 * up with the identical photo. */
export async function findTopicImage(query: string): Promise<StoryImage | null> {
  if (!ACCESS_KEY) return null;

  try {
    const searchUrl = new URL("https://api.unsplash.com/search/photos");
    searchUrl.searchParams.set("query", query);
    searchUrl.searchParams.set("per_page", "10");
    searchUrl.searchParams.set("orientation", "landscape");
    searchUrl.searchParams.set("content_filter", "high");

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { results: UnsplashPhoto[] };
    if (data.results.length === 0) return null;
    const photo = data.results[Math.floor(Math.random() * data.results.length)];

    // Required by the Unsplash API Guidelines whenever a photo is selected for use.
    fetch(`${photo.links.download_location}&client_id=${ACCESS_KEY}`).catch(() => {});

    return {
      url: photo.urls.regular,
      photographerName: photo.user.name,
      photographerUrl: withUtm(photo.user.links.html),
    };
  } catch {
    return null;
  }
}

export const UNSPLASH_CREDIT_URL = withUtm("https://unsplash.com");
