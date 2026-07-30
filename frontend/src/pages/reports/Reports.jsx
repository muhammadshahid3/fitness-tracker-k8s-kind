import { useEffect, useState, useCallback } from 'react';
import { Dumbbell, Flame, Scale, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import Card from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import { reportApi } from '../../api/endpoints';

const CATEGORY_COLORS = ['#B9FF4B', '#4C7EFF', '#FF6B5B', '#FFB74C', '#8FCC3A', '#3A5FC4', '#D9564A'];

export default function Reports() {
  const [period, setPeriod] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (p) => {
    setLoading(true);
    try {
      const res = await reportApi.get(p);
      setReport(res.data.data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(period);
  }, [period, fetchReport]);

  if (loading || !report) return <PageLoader />;

  const categoryData = Object.entries(report.workoutStats.byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-ink-light dark:text-ink-dark">
          {period === 'weekly' ? 'Weekly' : 'Monthly'} Progress Report
        </h3>
        <div className="flex rounded-xl border border-border-light dark:border-border-dark p-1">
          {['weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                period === p ? 'bg-lime text-ink-light' : 'text-ink-mutedLight dark:text-ink-mutedDark'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Dumbbell size={15} className="text-cobalt" />
            <span className="text-xs font-medium text-ink-mutedLight dark:text-ink-mutedDark">Workouts</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{report.workoutStats.totalWorkouts}</p>
          <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">{report.workoutStats.totalDuration} min total</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Flame size={15} className="text-coral" />
            <span className="text-xs font-medium text-ink-mutedLight dark:text-ink-mutedDark">Calories</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{report.caloriesReport.totalConsumed}</p>
          <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">~{report.caloriesReport.avgDailyCalories}/day avg</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Scale size={15} className="text-lime-dim" />
            <span className="text-xs font-medium text-ink-mutedLight dark:text-ink-mutedDark">Weight Change</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">
            {report.weightProgress.change > 0 ? '+' : ''}
            {report.weightProgress.change || 0} kg
          </p>
          <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">
            {report.weightProgress.startWeight ?? '—'} → {report.weightProgress.currentWeight ?? '—'} kg
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-amber" />
            <span className="text-xs font-medium text-ink-mutedLight dark:text-ink-mutedDark">Goals</span>
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">
            {report.goalReport.completed}/{report.goalReport.totalGoals}
          </p>
          <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">completed</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h4 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Workouts by Category</h4>
          {categoryData.length === 0 ? (
            <p className="py-10 text-center text-xs text-ink-mutedLight dark:text-ink-mutedDark">No workouts logged in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h4 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Macros ({period})</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Protein', value: report.caloriesReport.totalProtein, color: '#4C7EFF' },
              { label: 'Carbs', value: report.caloriesReport.totalCarbs, color: '#FFB74C' },
              { label: 'Fat', value: report.caloriesReport.totalFat, color: '#FF6B5B' },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between text-xs text-ink-mutedLight dark:text-ink-mutedDark">
                  <span>{m.label}</span>
                  <span className="font-mono font-medium text-ink-light dark:text-ink-dark">{m.value}g</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-hoverLight dark:bg-surface-hoverDark">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, (m.value / (report.caloriesReport.totalProtein + report.caloriesReport.totalCarbs + report.caloriesReport.totalFat || 1)) * 100)}%`, background: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <h4 className="mb-2 mt-6 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">Goal Achievement</h4>
          {report.goalReport.goals.length === 0 ? (
            <p className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">No goals to report.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {report.goalReport.goals.slice(0, 4).map((g) => (
                <div key={g._id} className="flex items-center justify-between text-xs">
                  <span className="text-ink-light dark:text-ink-dark">{g.title || g.type}</span>
                  <span className="font-mono text-ink-mutedLight dark:text-ink-mutedDark">{g.progressPercent}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="text-center text-xs text-ink-mutedLight dark:text-ink-mutedDark">
        Report generated {format(new Date(report.generatedAt), 'MMM d, yyyy · h:mm a')}
      </p>
    </div>
  );
}
