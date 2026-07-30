import { useEffect, useState, useCallback } from 'react';
import { Plus, Utensils, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import MealFormModal from './MealFormModal';
import { mealApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

const mealTypeColor = {
  Breakfast: 'bg-amber/10 text-amber',
  Lunch: 'bg-lime/10 text-lime-dim',
  Dinner: 'bg-cobalt/10 text-cobalt',
  Snacks: 'bg-coral/10 text-coral',
};

const MACRO_COLORS = ['#4C7EFF', '#FFB74C', '#FF6B5B'];

export default function Meals() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mealApi.summary();
      setSummary(res.data.data);
    } catch {
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editing) {
        await mealApi.update(editing._id, data);
        toast.success('Meal updated');
      } else {
        await mealApi.create(data);
        toast.success('Meal added');
      }
      setModalOpen(false);
      setEditing(null);
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await mealApi.remove(deleting._id);
      toast.success('Meal deleted');
      setDeleting(null);
      fetchSummary();
    } catch {
      toast.error('Failed to delete meal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  const macroData = summary
    ? [
        { name: 'Protein', value: summary.protein },
        { name: 'Carbs', value: summary.carbs },
        { name: 'Fat', value: summary.fat },
      ]
    : [];
  const calorieGoal = user?.dailyCalorieGoal || 2000;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <h3 className="mb-2 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Today's Macros</h3>
          {summary?.calories ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie data={macroData} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={3}>
                    {macroData.map((_, i) => (
                      <Cell key={i} fill={MACRO_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 text-xs">
                {macroData.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: MACRO_COLORS[i] }} />
                    <span className="text-ink-mutedLight dark:text-ink-mutedDark">
                      {m.name}: {m.value}g
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">No meals logged today yet.</p>
          )}
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Calorie Goal Progress</h3>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{summary?.calories || 0}</span>
            <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">/ {calorieGoal} kcal</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark">
            <div
              className="h-full rounded-full bg-lime transition-all"
              style={{ width: `${Math.min(100, ((summary?.calories || 0) / calorieGoal) * 100)}%` }}
            />
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">Today's Meals</h3>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Add Meal
        </Button>
      </div>

      {!summary?.meals?.length ? (
        <Card>
          <EmptyState icon={Utensils} title="No meals logged today" description="Add your first meal to start tracking nutrition." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.meals.map((m) => (
            <Card key={m._id} className="p-4">
              <div className="flex items-start justify-between">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${mealTypeColor[m.mealType]}`}>
                  {m.mealType}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(m);
                      setModalOpen(true);
                    }}
                    className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-surface-hoverLight dark:hover:bg-surface-hoverDark"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleting(m)}
                    className="focus-ring rounded-lg p-1.5 text-ink-mutedLight hover:bg-coral/10 hover:text-coral"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h4 className="mt-2 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">{m.name}</h4>
              <p className="mt-1 font-mono text-xs text-ink-mutedLight dark:text-ink-mutedDark">
                {m.calories} kcal · P{m.protein}g C{m.carbs}g F{m.fat}g
              </p>
            </Card>
          ))}
        </div>
      )}

      <MealFormModal
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
        title="Delete meal?"
        description={`This will permanently remove "${deleting?.name}".`}
        loading={submitting}
      />
    </div>
  );
}
