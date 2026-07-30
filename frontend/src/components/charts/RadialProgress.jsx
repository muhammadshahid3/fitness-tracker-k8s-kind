// Signature visual: a single activity ring (inspired by fitness-watch rings)
// used to represent the day's composite fitness score at a glance.
export default function RadialProgress({ value = 0, size = 120, stroke = 10, color = '#B9FF4B', label, sublabel }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-border-light dark:stroke-border-dark"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{Math.round(clamped)}</span>
        {label && <span className="text-[10px] uppercase tracking-wide text-ink-mutedLight dark:text-ink-mutedDark">{label}</span>}
        {sublabel && <span className="text-[10px] text-ink-mutedLight dark:text-ink-mutedDark">{sublabel}</span>}
      </div>
    </div>
  );
}
