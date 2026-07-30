export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
