import { useEffect, useState, useCallback } from 'react';
import { Plus, Scale, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import { weightApi } from '../../api/endpoints';

export default function Weight() {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, progressRes] = await Promise.all([weightApi.list({ limit: 30 }), weightApi.goalProgress()]);
      setLogs(logsRes.data.data);
      setProgress(progressRes.data.data);
    } catch {
      toast.error('Failed to load weight data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.weight || form.weight <= 0) return toast.error('Enter a valid weight');
    setSubmitting(true);
    try {
      await weightApi.create({ ...form, weight: Number(form.weight) });
      toast.success('Weight logged');
      setModalOpen(false);
      setForm({ weight: '', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await weightApi.remove(deleting._id);
      toast.success('Entry deleted');
      setDeleting(null);
      fetchData();
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  const chartData = [...logs].reverse().map((l) => ({ date: format(new Date(l.date), 'MMM d'), weight: l.weight }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">Weight Tracking</h3>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Log Weight
        </Button>
      </div>

      {progress && progress.goalWeight && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">Goal Progress</span>
              <div className="mt-1 flex items-baseline gap-2 font-mono text-sm text-ink-light dark:text-ink-dark">
                <span>{progress.startWeight} kg</span>
                <span className="text-ink-mutedLight dark:text-ink-mutedDark">→</span>
                <span className="font-semibold">{progress.currentWeight} kg</span>
                <span className="text-ink-mutedLight dark:text-ink-mutedDark">→</span>
                <span>{progress.goalWeight} kg</span>
              </div>
            </div>
            <span className="font-mono text-2xl font-semibold text-lime-dim">{progress.progressPercent}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark">
            <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${progress.progressPercent}%` }} />
          </div>
        </Card>
      )}

      {logs.length === 0 ? (
        <Card>
          <EmptyState icon={Scale} title="No weight entries yet" description="Log your weight to start tracking your trend." />
        </Card>
      ) : (
        <>
          <Card className="p-5">
            <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Weight Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={36} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#B9FF4B" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wide text-ink-mutedLight dark:text-ink-mutedDark">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Weight</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} className="border-b border-border-light dark:border-border-dark last:border-0">
                    <td className="px-4 py-3 font-mono text-xs text-ink-light dark:text-ink-dark">{format(new Date(l.date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-ink-light dark:text-ink-dark">{l.weight} kg</td>
                    <td className="px-4 py-3 text-xs text-ink-mutedLight dark:text-ink-mutedDark">{l.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setDeleting(l)} className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-coral/10 hover:text-coral">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Weight" maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Weight (kg)" type="number" step="0.1" min="0" required value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Input label="Notes" textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional" />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete entry?" description="This weight entry will be removed." loading={submitting} />
    </div>
  );
}
