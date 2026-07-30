import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="focus-ring rounded-lg border border-border-light dark:border-border-dark p-1.5 disabled:opacity-40 text-ink-light dark:text-ink-dark"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="font-mono text-xs text-ink-mutedLight dark:text-ink-mutedDark">
        Page {page} of {pages}
      </span>
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page >= pages}
        className="focus-ring rounded-lg border border-border-light dark:border-border-dark p-1.5 disabled:opacity-40 text-ink-light dark:text-ink-dark"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
