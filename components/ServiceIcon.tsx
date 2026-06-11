const PATHS: Record<string, React.ReactNode> = {
  site: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 8h18M6.5 6h.01M9 6h.01" />
    </>
  ),
  shop: (
    <>
      <path d="M4 5h2l2 11h9l2-8H7" />
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </>
  ),
  wrench: <path d="M14 6.5a3.5 3.5 0 0 0-4.7 4.2l-5 5a1.6 1.6 0 0 0 2.3 2.3l5-5a3.5 3.5 0 0 0 4.2-4.7l-2 2-1.8-1.8 2-2z" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  figma: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  migrate: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
};

export function ServiceIcon({ name }: { name: string }) {
  return (
    <span className="ic">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {PATHS[name] ?? PATHS.site}
      </svg>
    </span>
  );
}
