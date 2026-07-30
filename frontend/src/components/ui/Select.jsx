export default function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <label className="block text-left">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">{label}</span>}
      <select
        className={`focus-ring w-full rounded-xl border bg-surface-light dark:bg-surface-dark px-3.5 py-2.5 text-sm text-ink-light dark:text-ink-dark ${
          error ? 'border-coral' : 'border-border-light dark:border-border-dark'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-coral">{error}</span>}
    </label>
  );
}
