import { useEffect, useState, useCallback } from 'react';
import { Users, UserX, Dumbbell, Utensils, Target, UserPlus, Search, Ban, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import { adminApi } from '../../api/endpoints';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchAll = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([adminApi.stats(), adminApi.users({ page, limit: 10, search: search || undefined })]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setPagination(usersRes.data.pagination);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchAll(1), 300);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const handleToggleBlock = async (user) => {
    setBusyId(user._id);
    try {
      await adminApi.toggleBlock(user._id);
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
      fetchAll(pagination.page);
    } catch {
      toast.error('Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    setBusyId(deleting._id);
    try {
      await adminApi.deleteUser(deleting._id);
      toast.success('User deleted');
      setDeleting(null);
      fetchAll(pagination.page);
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !stats) return <PageLoader />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, accent: 'text-lime-dim bg-lime/10' },
    { label: 'Blocked Users', value: stats?.blockedUsers, icon: UserX, accent: 'text-coral bg-coral/10' },
    { label: 'New This Week', value: stats?.newUsersThisWeek, icon: UserPlus, accent: 'text-cobalt bg-cobalt/10' },
    { label: 'Total Workouts', value: stats?.totalWorkouts, icon: Dumbbell, accent: 'text-amber bg-amber/10' },
    { label: 'Total Meals', value: stats?.totalMeals, icon: Utensils, accent: 'text-lime-dim bg-lime/10' },
    { label: 'Total Goals', value: stats?.totalGoals, icon: Target, accent: 'text-cobalt bg-cobalt/10' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((s) => (
          <Card key={s.label} className="p-4">
            <div className={`inline-flex rounded-lg p-2 ${s.accent}`}>
              <s.icon size={15} />
            </div>
            <p className="mt-3 font-mono text-xl font-semibold text-ink-light dark:text-ink-dark">{s.value ?? 0}</p>
            <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">User Management</h3>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mutedLight dark:text-ink-mutedDark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="focus-ring w-56 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-2 pl-9 pr-3 text-sm text-ink-light dark:text-ink-dark"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wide text-ink-mutedLight dark:text-ink-mutedDark">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-border-light dark:border-border-dark last:border-0">
                <td className="px-4 py-3 font-medium text-ink-light dark:text-ink-dark">{u.name}</td>
                <td className="px-4 py-3 text-ink-mutedLight dark:text-ink-mutedDark">{u.email}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-mutedLight dark:text-ink-mutedDark">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${u.isBlocked ? 'bg-coral/10 text-coral' : 'bg-lime/10 text-lime-dim'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleToggleBlock(u)}
                      disabled={busyId === u._id}
                      className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-amber/10 hover:text-amber disabled:opacity-50"
                      title={u.isBlocked ? 'Unblock user' : 'Block user'}
                    >
                      {u.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                    </button>
                    <button
                      onClick={() => setDeleting(u)}
                      className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-coral/10 hover:text-coral"
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-mutedLight dark:text-ink-mutedDark">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      <Pagination page={pagination.page} pages={pagination.pages} onChange={fetchAll} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        description={`This will permanently delete "${deleting?.name}" and cannot be undone.`}
        loading={busyId === deleting?._id}
      />
    </div>
  );
}
