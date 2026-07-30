import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Scale,
  Droplets,
  Moon,
  Target,
  FileBarChart,
  ShieldCheck,
  User,
  Activity,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/meals', label: 'Diet Tracker', icon: Utensils },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/water', label: 'Water Intake', icon: Droplets },
  { to: '/sleep', label: 'Sleep', icon: Moon },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-50 lg:z-0 lg:static inset-y-0 left-0 w-64 shrink-0 border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-lime p-1.5">
              <Activity size={18} className="text-ink-light" strokeWidth={2.5} />
            </div>
            <span className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">Pulse</span>
          </div>
          <button onClick={onClose} className="focus-ring rounded-lg p-1.5 text-ink-mutedLight lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex flex-col gap-1 px-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lime/15 text-ink-light dark:text-lime'
                    : 'text-ink-mutedLight dark:text-ink-mutedDark hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring mt-2 flex items-center gap-3 rounded-xl border-t border-border-light dark:border-border-dark px-3 pt-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'text-cobalt' : 'text-ink-mutedLight dark:text-ink-mutedDark hover:text-cobalt'
                }`
              }
            >
              <ShieldCheck size={17} />
              Admin Panel
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
