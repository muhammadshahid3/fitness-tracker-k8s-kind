export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      {Icon && (
        <div className="rounded-2xl bg-surface-hoverLight dark:bg-surface-hoverDark p-3.5 text-ink-mutedLight dark:text-ink-mutedDark">
          <Icon size={26} />
        </div>
      )}
      <div>
        <p className="font-display font-semibold text-ink-light dark:text-ink-dark">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-mutedLight dark:text-ink-mutedDark max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
