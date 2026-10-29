export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 25.5 70.6 A 32 32 0 1 1 74.5 70.6"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path d="M 50 50 L 82 82" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-7 w-7 shrink-0" />
      <span className="font-sans text-2xl font-bold tracking-tight">Unspun</span>
    </span>
  );
}
