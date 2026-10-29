"use client";

import { useState } from "react";
import { useReadingMode } from "./ReadingMode";

export function SourceReveal({ sourceNames }: { sourceNames: string[] }) {
  const { hidePublishers } = useReadingMode();
  const [revealed, setRevealed] = useState(false);

  const showNames = !hidePublishers || revealed;

  return (
    <div className="font-sans text-sm">
      {showNames ? (
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">Sources: </span>
          {sourceNames.join(", ")}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="inline-flex items-center gap-1.5 text-accent hover:underline underline-offset-2"
        >
          Reveal sources ({sourceNames.length})
        </button>
      )}
    </div>
  );
}
