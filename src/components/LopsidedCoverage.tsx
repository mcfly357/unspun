"use client";

import { useState } from "react";
import Link from "next/link";
import { StoryImage } from "./StoryImage";

interface LopsidedStory {
  id: string;
  topic: string;
  headline: string;
  imageUrl: string | null;
  imagePhotographer: string | null;
  imagePhotographerUrl: string | null;
}

export function LopsidedCoverage({ stories }: { stories: LopsidedStory[] }) {
  const [open, setOpen] = useState(false);
  if (stories.length === 0) return null;

  return (
    <div className="rounded-2xl border border-rule bg-paper-raised shadow-card mb-8 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left"
      >
        <span className="font-sans text-sm font-bold text-ink">
          Lopsided coverage <span className="text-ink-soft font-normal">({stories.length})</span>
        </span>
        <span className={`font-sans text-xs text-ink-soft transition-transform ${open ? "rotate-180" : ""}`}>
          &#9660;
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <p className="font-sans text-xs text-ink-soft mb-3">
            Stories where independent coverage leaned heavily to one side. Reveal sources on the story to see
            the breakdown.
          </p>
          <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group block w-56 shrink-0 rounded-xl border border-rule overflow-hidden hover:shadow-card-hover transition-shadow"
              >
                <StoryImage
                  topic={story.topic}
                  className="h-24"
                  imageUrl={story.imageUrl}
                  imagePhotographer={story.imagePhotographer}
                  imagePhotographerUrl={story.imagePhotographerUrl}
                  linked={false}
                />
                <div className="p-3">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    &#9888; Skewed coverage
                  </span>
                  <p className="text-sm font-semibold leading-snug mt-0.5 group-hover:text-accent transition-colors">
                    {story.headline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
