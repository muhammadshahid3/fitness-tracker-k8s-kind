import Card from '../ui/Card';

export default function StatCard({ icon: Icon, label, value, unit, accent = 'lime', footer }) {
  const accentClasses = {
    lime: 'text-lime bg-lime/10',
    cobalt: 'text-cobalt bg-cobalt/10',
    coral: 'text-coral bg-coral/10',
    amber: 'text-amber bg-amber/10',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">{label}</span>
        {Icon && (
          <div className={`rounded-lg p-2 ${accentClasses[accent]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{value}</span>
        {unit && <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">{unit}</span>}
      </div>
      {footer && <div className="mt-2 text-xs text-ink-mutedLight dark:text-ink-mutedDark">{footer}</div>}
    </Card>
  );
}
