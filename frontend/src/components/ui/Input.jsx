export default function Input({ label, error, className = '', textarea = false, ...props }) {
  const Component = textarea ? 'textarea' : 'input';
  return (
    <label className="block text-left">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">{label}</span>}
      <Component
        className={`focus-ring w-full rounded-xl border bg-surface-light dark:bg-surface-dark px-3.5 py-2.5 text-sm text-ink-light dark:text-ink-dark placeholder:text-ink-mutedLight/60 dark:placeholder:text-ink-mutedDark/60 ${
          error ? 'border-coral' : 'border-border-light dark:border-border-dark'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  );
}
