import { useEffect, useState, useCallback } from 'react';
import { Plus, Target, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import GoalFormModal from './GoalFormModal';
import { goalApi } from '../../api/endpoints';

const typeLabels = { weight_loss: 'Weight Loss', weight_gain: 'Weight Gain', muscle_gain: 'Muscle Gain', maintain_weight: 'Maintain Weight' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingGoal, setUpdatingGoal] = useState(null);
  const [currentValueInput, setCurrentValueInput] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalApi.list();
      setGoals(res.data.data);
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await goalApi.create(data);
      toast.success('Goal created');
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await goalApi.update(updatingGoal._id, { currentValue: Number(currentValueInput) });
      toast.success('Progress updated');
      setUpdatingGoal(null);
      fetchGoals();
    } catch {
      toast.error('Failed to update progress');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await goalApi.remove(deleting._id);
      toast.success('Goal deleted');
      setDeleting(null);
      fetchGoals();
    } catch {
      toast.error('Failed to delete goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">Your Goals</h3>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No goals yet" description="Create a goal to track your fitness progress over time." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((g) => (
            <Card key={g._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full bg-cobalt/10 px-2.5 py-0.5 text-xs font-medium text-cobalt">{typeLabels[g.type]}</span>
                  {g.status === 'completed' && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-medium text-lime-dim">
                      <Check size={11} /> Completed
                    </span>
                  )}
                  <h4 className="mt-2 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">
                    {g.title || typeLabels[g.type]}
                  </h4>
                </div>
                <button onClick={() => setDeleting(g)} className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-coral/10 hover:text-coral">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between font-mono text-xs text-ink-mutedLight dark:text-ink-mutedDark">
                <span>{g.startValue} kg</span>
                <span className="font-semibold text-ink-light dark:text-ink-dark">{g.progressPercent}%</span>
                <span>{g.targetValue} kg</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark">
                <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${g.progressPercent}%` }} />
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">Target: {format(new Date(g.targetDate), 'MMM d, yyyy')}</span>
                {g.status === 'active' && (
                  <button
                    onClick={() => {
                      setUpdatingGoal(g);
                      setCurrentValueInput(String(g.currentValue ?? g.startValue));
                    }}
                    className="text-xs font-medium text-lime-dim hover:underline"
                  >
                    Update
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <GoalFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} loading={submitting} />

      <Modal open={!!updatingGoal} onClose={() => setUpdatingGoal(null)} title="Update Progress" maxWidth="max-w-xs">
        <form onSubmit={handleUpdateProgress} className="flex flex-col gap-4">
          <Input label="Current Value (kg)" type="number" step="0.1" required value={currentValueInput} onChange={(e) => setCurrentValueInput(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setUpdatingGoal(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete goal?" description="This goal will be permanently removed." loading={submitting} />
    </div>
  );
}
