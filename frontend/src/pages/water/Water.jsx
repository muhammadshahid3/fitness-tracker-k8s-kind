import { useEffect, useState, useCallback } from 'react';
import { Plus, Droplets, Settings2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RadialProgress from '../../components/charts/RadialProgress';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { PageLoader } from '../../components/ui/Spinner';
import { waterApi } from '../../api/endpoints';

const quickAmounts = [150, 250, 500, 750];

export default function Water() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState({});
  const [loading, setLoading] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([waterApi.today(), waterApi.history(7)]);
      setToday(todayRes.data.data);
      setHistory(historyRes.data.data);
    } catch {
      toast.error('Failed to load water data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (amount) => {
    try {
      await waterApi.add({ amount });
      toast.success(`+${amount} ml logged`);
      fetchData();
    } catch {
      toast.error('Failed to log water');
    }
  };

  const handleDelete = async (id) => {
    try {
      await waterApi.remove(id);
      fetchData();
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const handleSetGoal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await waterApi.setGoal(Number(goalInput));
      toast.success('Daily goal updated');
      setGoalModalOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to update goal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  const chartData = Object.entries(history).map(([date, amount]) => ({ day: format(new Date(date), 'EEE'), amount }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center gap-3 p-6 lg:col-span-1">
          <RadialProgress value={today.progressPercent} size={140} stroke={12} color="#4C7EFF" label="of goal" />
          <div className="text-center">
            <p className="font-mono text-sm font-semibold text-ink-light dark:text-ink-dark">
              {today.totalIntake} / {today.goal} ml
            </p>
            <button
              onClick={() => {
                setGoalInput(String(today.goal));
                setGoalModalOpen(true);
              }}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cobalt hover:underline"
            >
              <Settings2 size={12} /> Adjust goal
            </button>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Quick Add</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleAdd(amt)}
                className="focus-ring flex flex-col items-center gap-1.5 rounded-xl border border-border-light dark:border-border-dark py-4 text-cobalt hover:bg-cobalt/10 transition-colors"
              >
                <Droplets size={18} />
                <span className="text-xs font-semibold">{amt} ml</span>
              </button>
            ))}
          </div>
          <h3 className="mb-3 mt-6 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">7-Day History</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="amount" fill="#4C7EFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {today.logs?.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Today's Entries</h3>
          <div className="flex flex-wrap gap-2">
            {today.logs.map((log) => (
              <div
                key={log._id}
                className="flex items-center gap-2 rounded-full border border-border-light dark:border-border-dark px-3 py-1.5 text-xs text-ink-light dark:text-ink-dark"
              >
                <Droplets size={12} className="text-cobalt" />
                {log.amount} ml
                <button onClick={() => handleDelete(log._id)} className="text-ink-mutedLight hover:text-coral">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={goalModalOpen} onClose={() => setGoalModalOpen(false)} title="Set Daily Water Goal" maxWidth="max-w-xs">
        <form onSubmit={handleSetGoal} className="flex flex-col gap-4">
          <Input label="Goal (ml)" type="number" min="1" required value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
