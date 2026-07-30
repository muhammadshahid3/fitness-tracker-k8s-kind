import { useState, useEffect, useRef } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { notificationApi } from '../../api/endpoints';

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    notificationApi
      .list()
      .then((res) => {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="focus-ring rounded-lg p-1.5 text-ink-light dark:text-ink-dark lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="font-display text-lg font-semibold text-ink-light dark:text-ink-dark">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="focus-ring rounded-lg p-2 text-ink-mutedLight hover:bg-surface-hoverLight dark:text-ink-mutedDark dark:hover:bg-surface-hoverDark"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="focus-ring relative rounded-lg p-2 text-ink-mutedLight hover:bg-surface-hoverLight dark:text-ink-mutedDark dark:hover:bg-surface-hoverDark"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-card">
              <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4 py-3">
                <span className="text-sm font-semibold text-ink-light dark:text-ink-dark">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs font-medium text-lime-dim hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-ink-mutedLight dark:text-ink-mutedDark">
                    You're all caught up
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`border-b border-border-light dark:border-border-dark px-4 py-3 last:border-0 ${
                        !n.isRead ? 'bg-lime/5' : ''
                      }`}
                    >
                      <p className="text-sm font-medium text-ink-light dark:text-ink-dark">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-mutedLight dark:text-ink-mutedDark">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button onClick={() => setUserMenuOpen((o) => !o)} className="focus-ring flex items-center gap-2 rounded-full">
            {user?.profilePicture ? (
              <img
                src={`${import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'}${user.profilePicture}`}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover border border-border-light dark:border-border-dark"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cobalt/15 font-display text-sm font-semibold text-cobalt">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-card p-1.5">
              <p className="truncate px-3 py-2 text-sm font-medium text-ink-light dark:text-ink-dark">{user?.name}</p>
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-mutedLight hover:bg-surface-hoverLight dark:text-ink-mutedDark dark:hover:bg-surface-hoverDark"
              >
                <UserIcon size={15} /> Profile
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-coral hover:bg-coral/10"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
