"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS } from "@/lib/regions";

const STATUS_OPTIONS = [
  { value: "", label: "Any verification status" },
  { value: "supported", label: "Evidence reviewed" },
  { value: "unverified", label: "Partially verified" },
  { value: "disputed", label: "Claims disputed" },
];

function useUpdateParam() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/?${params.toString()}`);
  };
}

export function FeedFilters() {
  const searchParams = useSearchParams();
  const updateParam = useUpdateParam();

  const region = searchParams.get("region") ?? "";
  const status = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3 font-sans text-sm">
      <label className="flex items-center gap-2">
        <span className="text-ink-soft text-xs uppercase tracking-wide">Region</span>
        <select
          value={region}
          onChange={(e) => updateParam("region", e.target.value)}
          className="rounded-lg border border-rule bg-paper-raised px-2.5 py-1.5 text-ink"
        >
          <option value="">For you (US + world highlights)</option>
          <option value="all">All regions</option>
          <option value="us">US only</option>
          {REGIONS.filter((r) => r.value !== "us").map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-ink-soft text-xs uppercase tracking-wide">Verification</span>
        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-lg border border-rule bg-paper-raised px-2.5 py-1.5 text-ink"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
