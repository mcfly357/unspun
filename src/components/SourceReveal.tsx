"use client";

import { useState } from "react";
import { useReadingMode } from "./ReadingMode";
import { LEAN_GROUP_LABEL, type LeanBreakdown } from "@/lib/leanSkew";

function LeanBar({ breakdown }: { breakdown: LeanBreakdown }) {
  return (
    <div className="mt-3">
      {breakdown.skewedTo && (
        <p className="text-ink-soft mb-1.5">
          <span className="font-semibold text-ink">Coverage skew: </span>
          covered mostly by {LEAN_GROUP_LABEL[breakdown.skewedTo]} sources ({breakdown[breakdown.skewedTo]}%)
        </p>
      )}
      <div className="flex h-2 w-full max-w-xs overflow-hidden rounded-full bg-neutral-100">
        {breakdown.left > 0 && <div className="h-full bg-sky-500" style={{ width: `${breakdown.left}%` }} />}
        {breakdown.center > 0 && <div className="h-full bg-neutral-400" style={{ width: `${breakdown.center}%` }} />}
        {breakdown.right > 0 && <div className="h-full bg-rose-500" style={{ width: `${breakdown.right}%` }} />}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
        <span>Left {breakdown.left}%</span>
        <span>Center {breakdown.center}%</span>
        <span>Right {breakdown.right}%</span>
      </div>
    </div>
  );
}

export function SourceReveal({
  sourceNames,
  leanBreakdown,
}: {
  sourceNames: string[];
  leanBreakdown?: LeanBreakdown;
}) {
  const { hidePublishers } = useReadingMode();
  const [revealed, setRevealed] = useState(false);

  const showNames = !hidePublishers || revealed;

  return (
    <div className="font-sans text-sm">
      {showNames ? (
        <>
          <p className="text-ink-soft">
            <span className="font-semibold text-ink">Sources: </span>
            {sourceNames.join(", ")}
          </p>
          {leanBreakdown && <LeanBar breakdown={leanBreakdown} />}
        </>
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
