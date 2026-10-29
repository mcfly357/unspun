"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TOPICS } from "@/lib/topics";

export function TopicNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTopic = pathname === "/" ? searchParams.get("topic") : null;

  const items = [{ value: null as string | null, label: "Top Stories" }, ...TOPICS];

  return (
    <nav className="flex items-center gap-6 font-sans text-sm">
      {items.map((item) => {
        const href = item.value ? `/?topic=${item.value}` : "/";
        const isActive = pathname === "/" && activeTopic === item.value;
        return (
          <Link
            key={item.label}
            href={href}
            className={`transition-colors ${
              isActive ? "text-accent font-semibold" : "text-ink-soft hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
