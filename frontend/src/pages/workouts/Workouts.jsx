import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Dumbbell, Pencil, Trash2, Clock, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import WorkoutFormModal from './WorkoutFormModal';
import { workoutApi } from '../../api/endpoints';

const categories = ['', 'Chest', 'Back', 'Legs', 'Cardio', 'Shoulder', 'Arms', 'Core'];

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkouts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await workoutApi.list({ page, limit: 8, search: search || undefined, category: category || undefined });
        setWorkouts(res.data.data);
        setPagination(res.data.pagination);
      } catch {
        toast.error('Failed to load workouts');
      } finally {
        setLoading(false);
      }
    },
    [search, category]
  );

  useEffect(() => {
    const t = setTimeout(() => fetchWorkouts(1), 300);
    return () => clearTimeout(t);
  }, [fetchWorkouts]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await workoutApi.update(editing._id, data);
        toast.success('Workout updated');
      } else {
        await workoutApi.create(data);
        toast.success('Workout added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchWorkouts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await workoutApi.remove(deleting._id);
      toast.success('Workout deleted');
      setDeleting(null);
      fetchWorkouts(pagination.page);
    } catch {
      toast.error('Failed to delete workout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mutedLight dark:text-ink-mutedDark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workouts..."
            className="focus-ring w-full rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark py-2.5 pl-9 pr-3 text-sm text-ink-light dark:text-ink-dark"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={categories.map((c) => ({ value: c, label: c || 'All categories' }))}
            className="!py-2"
          />
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Workout
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : workouts.length === 0 ? (
        <Card>
          <EmptyState
            icon={Dumbbell}
            title="No workouts yet"
            description="Log your first workout to start tracking your training."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={16} /> Add Workout
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workouts.map((w) => (
              <Card key={w._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block rounded-full bg-cobalt/10 px-2.5 py-0.5 text-xs font-medium text-cobalt">
                      {w.category}
                    </span>
                    <h3 className="mt-2 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">{w.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(w);
                        setModalOpen(true);
                      }}
                      className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(w)}
                      className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-coral/10 hover:text-coral"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-ink-mutedLight dark:text-ink-mutedDark">
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {w.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={13} /> {w.caloriesBurned} kcal
                  </span>
                </div>
                {w.notes && <p className="mt-2 text-xs text-ink-mutedLight dark:text-ink-mutedDark line-clamp-2">{w.notes}</p>}
                <p className="mt-3 font-mono text-[11px] text-ink-mutedLight dark:text-ink-mutedDark">
                  {format(new Date(w.date), 'MMM d, yyyy')}
                </p>
              </Card>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={fetchWorkouts} />
        </>
      )}

      <WorkoutFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialData={editing}
        loading={submitting}
      />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete workout?"
        description={`This will permanently remove "${deleting?.name}".`}
        loading={submitting}
      />
    </div>
  );
}
