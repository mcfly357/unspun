import { TopicArt } from "./TopicArt";
import { UNSPLASH_CREDIT_URL } from "@/lib/unsplash";

interface StoryImageProps {
  topic: string;
  className?: string;
  imageUrl?: string | null;
  imagePhotographer?: string | null;
  imagePhotographerUrl?: string | null;
  /** Set false when this sits inside another <a> (card links) — nested
   * anchors are invalid HTML, so attribution renders as plain text there.
   * The clickable, fully-linked version is used on the story detail page. */
  linked?: boolean;
}

/** Renders the real (generic, topic-matched) stock photo when one was found
 * at synthesis time, with required Unsplash attribution; otherwise falls
 * back to the abstract topic art. Never implies the photo depicts the
 * actual event — it's decorative. */
export function StoryImage({
  topic,
  className = "",
  imageUrl,
  imagePhotographer,
  imagePhotographerUrl,
  linked = true,
}: StoryImageProps) {
  if (!imageUrl) {
    return <TopicArt topic={topic} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      {imagePhotographer &&
        imagePhotographerUrl &&
        (linked ? (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-2 py-0.5 font-sans text-[10px] text-white/80">
            Photo:{" "}
            <a
              href={imagePhotographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              {imagePhotographer}
            </a>{" "}
            /{" "}
            <a href={UNSPLASH_CREDIT_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
              Unsplash
            </a>
          </span>
        ) : (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/55 px-2 py-0.5 font-sans text-[10px] text-white/80">
            Photo: {imagePhotographer} / Unsplash
          </span>
        ))}
    </div>
  );
}
