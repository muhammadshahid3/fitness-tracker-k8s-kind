import { Activity } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-light dark:bg-base-dark px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 rounded-xl bg-lime p-2.5">
            <Activity size={22} className="text-ink-light" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink-light dark:text-ink-dark">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-ink-mutedLight dark:text-ink-mutedDark">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
