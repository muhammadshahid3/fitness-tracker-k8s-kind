const variants = {
  primary: 'bg-lime text-ink-light hover:bg-lime-dim',
  secondary:
    'bg-transparent border border-border-light dark:border-border-dark text-ink-light dark:text-ink-dark hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark',
  danger: 'bg-coral text-white hover:bg-coral-dim',
  ghost: 'bg-transparent text-ink-light dark:text-ink-dark hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark',
};

export default function Button({ variant = 'primary', className = '', children, loading = false, disabled, ...props }) {
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
