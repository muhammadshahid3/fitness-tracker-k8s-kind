import { useEffect, useState } from 'react';
import { Flame, Droplets, Scale, Target, Dumbbell, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';
import RadialProgress from '../components/charts/RadialProgress';
import { PageLoader } from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { dashboardApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.get(), dashboardApi.weekly()])
      .then(([d, w]) => {
        setData(d.data.data);
        setWeekly(w.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (!data) return <EmptyState title="Couldn't load dashboard" description="Please try refreshing the page." />;

  const chartData = weekly
    ? weekly.labels.map((label, i) => ({
        day: format(new Date(label), 'EEE'),
        consumed: weekly.caloriesConsumed[i],
        burned: weekly.caloriesBurned[i],
        water: weekly.waterIntake[i],
        sleep: weekly.sleepHours[i],
      }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Hey {user?.name?.split(' ')[0]}, here's today's snapshot
        </h2>
        <p className="text-sm text-ink-mutedLight dark:text-ink-mutedDark">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Top row: fitness score ring + key stats */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center gap-2 p-5">
          <RadialProgress value={data.fitnessScore} label="Score" sublabel="/ 100" />
          <span className="text-xs font-medium text-ink-mutedLight dark:text-ink-mutedDark">Daily Fitness Score</span>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:grid-cols-4">
          <StatCard icon={Flame} label="Calories Consumed" value={data.caloriesConsumed} unit="kcal" accent="amber" />
          <StatCard icon={Dumbbell} label="Calories Burned" value={data.caloriesBurned} unit="kcal" accent="coral" />
          <StatCard
            icon={Droplets}
            label="Water Intake"
            value={data.waterIntake}
            unit={`/ ${data.waterGoal} ml`}
            accent="cobalt"
          />
          <StatCard
            icon={Scale}
            label="Current Weight"
            value={data.currentWeight ?? '—'}
            unit={data.currentWeight ? 'kg' : ''}
            accent="lime"
          />
        </div>
      </div>

      {/* Second row: BMI + goal weight + workout summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">BMI Calculator</span>
            <TrendingUp size={16} className="text-ink-mutedLight dark:text-ink-mutedDark" />
          </div>
          {data.bmi ? (
            <>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{data.bmi}</span>
              </div>
              <span className="mt-1 inline-block rounded-full bg-lime/15 px-2.5 py-0.5 text-xs font-medium text-lime-dim">
                {data.bmiCategory}
              </span>
            </>
          ) : (
            <p className="mt-3 text-xs text-ink-mutedLight dark:text-ink-mutedDark">
              Add your height and weight in your profile to calculate BMI.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">Goal Weight</span>
            <Target size={16} className="text-ink-mutedLight dark:text-ink-mutedDark" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">
              {data.goalWeight ?? '—'}
            </span>
            {data.goalWeight && <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">kg</span>}
          </div>
          {data.currentWeight && data.goalWeight && (
            <p className="mt-1 text-xs text-ink-mutedLight dark:text-ink-mutedDark">
              {Math.abs(data.currentWeight - data.goalWeight).toFixed(1)} kg to go
            </p>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-mutedLight dark:text-ink-mutedDark">Today's Workouts</span>
            <Dumbbell size={16} className="text-ink-mutedLight dark:text-ink-mutedDark" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-semibold text-ink-light dark:text-ink-dark">{data.workoutCount}</span>
            <span className="text-xs text-ink-mutedLight dark:text-ink-mutedDark">logged</span>
          </div>
          {data.todaysWorkouts?.[0] && (
            <p className="mt-1 truncate text-xs text-ink-mutedLight dark:text-ink-mutedDark">
              {data.todaysWorkouts[0].name} · {data.todaysWorkouts[0].category}
            </p>
          )}
        </Card>
      </div>

      {/* Weekly charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">
            Weekly Calories: In vs Out
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="consumed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFB74C" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FFB74C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="burned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B5B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF6B5B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="consumed" name="Consumed" stroke="#FFB74C" fill="url(#consumed)" strokeWidth={2} />
              <Area type="monotone" dataKey="burned" name="Burned" stroke="#FF6B5B" fill="url(#burned)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-display text-sm font-semibold text-ink-light dark:text-ink-dark">
            Weekly Water & Sleep
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="water" name="Water (ml)" fill="#4C7EFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sleep" name="Sleep (hrs)" fill="#B9FF4B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
