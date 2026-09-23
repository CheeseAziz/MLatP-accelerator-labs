type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const ChatIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 5h16v11H9l-5 4V5z" /></svg>
);
export const DocIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>
);
export const MailIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
export const PlusIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const ClipIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="m21 11-8.6 8.6a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7L10 17.4a1.7 1.7 0 0 1-2.4-2.4l8-8" /></svg>
);
export const ArrowUpIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
export const TrashIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
);
export const XIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const MenuIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const UploadIcon = ({ className = "h-5 w-5" }: P) => (
  <svg {...base} className={className}><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>
);
export const SearchIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const SparkIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>
);
export const SendIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z" /></svg>
);
export const CopyIcon = ({ className = "h-4 w-4" }: P) => (
  <svg {...base} className={className}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
);

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="7" fill="var(--color-brand)" />
        <path
          d="M16 6c-4 0-7 3-7 6.5 0 1.2.3 2.2.9 3.1C8.7 16.5 8 17.8 8 19.3 8 22 10.4 24 13.3 24H15v3h2v-3h1.7c2.9 0 5.3-2 5.3-4.7 0-1.5-.7-2.8-1.9-3.7.6-.9.9-1.9.9-3.1C23 9 20 6 16 6z"
          fill="#fff"
        />
      </svg>
      {!compact && (
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-ink">River Tree</div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Insurance</div>
        </div>
      )}
    </div>
  );
}
