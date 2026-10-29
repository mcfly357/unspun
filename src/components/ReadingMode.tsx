"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "unspun:hidePublishers";

const ReadingModeContext = createContext<{
  hidePublishers: boolean;
  setHidePublishers: (v: boolean) => void;
}>({ hidePublishers: true, setHidePublishers: () => {} });

export function ReadingModeProvider({ children }: { children: React.ReactNode }) {
  const [hidePublishers, setHidePublishersState] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setHidePublishersState(stored === "true");
  }, []);

  function setHidePublishers(v: boolean) {
    setHidePublishersState(v);
    window.localStorage.setItem(STORAGE_KEY, String(v));
  }

  return (
    <ReadingModeContext.Provider value={{ hidePublishers, setHidePublishers }}>
      {children}
    </ReadingModeContext.Provider>
  );
}

export function useReadingMode() {
  return useContext(ReadingModeContext);
}

export function ReadingModeToggle() {
  const { hidePublishers, setHidePublishers } = useReadingMode();

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-sans text-sm font-semibold text-ink">Hide publisher identities</p>
        <p className="font-sans text-xs text-ink-soft mt-1 leading-relaxed">
          Read the story first. Reveal sources when you choose.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={hidePublishers}
        onClick={() => setHidePublishers(!hidePublishers)}
        className={`relative shrink-0 mt-0.5 h-6 w-11 rounded-full transition-colors ${
          hidePublishers ? "bg-accent" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            hidePublishers ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
