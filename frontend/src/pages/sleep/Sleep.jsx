import { useEffect, useState, useCallback } from 'react';
import { Plus, Moon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import { sleepApi } from '../../api/endpoints';

const qualities = ['Poor', 'Fair', 'Good', 'Excellent'];
const qualityColor = { Poor: 'text-coral bg-coral/10', Fair: 'text-amber bg-amber/10', Good: 'text-cobalt bg-cobalt/10', Excellent: 'text-lime-dim bg-lime/10' };

export default function Sleep() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ hours: '', quality: 'Good', date: new Date().toISOString().split('T')[0], notes: '' });
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sleepApi.weeklyReport();
      setReport(res.data.data);
    } catch {
      toast.error('Failed to load sleep data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hours || form.hours < 0) return toast.error('Enter valid sleep hours');
    setSubmitting(true);
    try {
      await sleepApi.create({ ...form, hours: Number(form.hours) });
      toast.success('Sleep logged');
      setModalOpen(false);
      setForm({ hours: '', quality: 'Good', date: new Date().toISOString().split('T')[0], notes: '' });
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
      await sleepApi.remove(deleting._id);
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

  const chartData = report.logs.map((l) => ({ day: format(new Date(l.date), 'EEE'), hours: l.hours }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5 sm:col-span-1">
          <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">Avg Sleep (7 days)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-semibold text-ink-light dark:text-ink-dark">{report.avgHours}</span>
            <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">hrs / night</span>
          </div>
        </Card>
        <Card className="p-5 sm:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Weekly Sleep Report</h3>
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Log Sleep
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="hours" fill="#B9FF4B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {report.logs.length === 0 ? (
        <Card>
          <EmptyState icon={Moon} title="No sleep entries yet" description="Log your sleep to see your weekly report." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark text-xs uppercase tracking-wide text-ink-mutedLight dark:text-ink-mutedDark">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Hours</th>
                <th className="px-4 py-3 font-medium">Quality</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {[...report.logs].reverse().map((l) => (
                <tr key={l._id} className="border-b border-border-light dark:border-border-dark last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-ink-light dark:text-ink-dark">{format(new Date(l.date), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-ink-light dark:text-ink-dark">{l.hours} hrs</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${qualityColor[l.quality]}`}>{l.quality}</span>
                  </td>
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
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Sleep" maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Hours Slept" type="number" step="0.5" min="0" max="24" required value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          <Select label="Quality" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} options={qualities.map((q) => ({ value: q, label: q }))} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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

      <ConfirmDialog open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete entry?" description="This sleep entry will be removed." loading={submitting} />
    </div>
  );
}
