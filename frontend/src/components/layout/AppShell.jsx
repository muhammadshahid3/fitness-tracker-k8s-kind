import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titles = {
  '/dashboard': 'Dashboard',
  '/workouts': 'Workouts',
  '/meals': 'Diet Tracker',
  '/weight': 'Weight Tracking',
  '/water': 'Water Intake',
  '/sleep': 'Sleep Tracking',
  '/goals': 'Goals',
  '/reports': 'Progress Reports',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || 'Pulse';

  return (
    <div className="flex min-h-screen bg-base-light dark:bg-base-dark">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
