const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const WeightLog = require('../models/WeightLog');
const Goal = require('../models/Goal');
const asyncHandler = require('../middleware/asyncHandler');

const getRangeStart = (period) => {
  const date = new Date();
  if (period === 'monthly') {
    date.setDate(date.getDate() - 30);
  } else {
    date.setDate(date.getDate() - 7);
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

// @desc    Generate a weekly or monthly progress report
// @route   GET /api/reports?period=weekly|monthly
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const period = req.query.period === 'monthly' ? 'monthly' : 'weekly';
  const startDate = getRangeStart(period);
  const userId = req.user._id;

  const [workouts, meals, weightLogs, goals] = await Promise.all([
    Workout.find({ user: userId, date: { $gte: startDate } }),
    Meal.find({ user: userId, date: { $gte: startDate } }),
    WeightLog.find({ user: userId, date: { $gte: startDate } }).sort({ date: 1 }),
    Goal.find({ user: userId }),
  ]);

  // Workout statistics
  const workoutStats = {
    totalWorkouts: workouts.length,
    totalDuration: workouts.reduce((s, w) => s + w.duration, 0),
    totalCaloriesBurned: workouts.reduce((s, w) => s + w.caloriesBurned, 0),
    byCategory: {},
  };
  workouts.forEach((w) => {
    workoutStats.byCategory[w.category] = (workoutStats.byCategory[w.category] || 0) + 1;
  });

  // Calories report
  const caloriesReport = {
    totalConsumed: meals.reduce((s, m) => s + m.calories, 0),
    totalProtein: meals.reduce((s, m) => s + m.protein, 0),
    totalCarbs: meals.reduce((s, m) => s + m.carbs, 0),
    totalFat: meals.reduce((s, m) => s + m.fat, 0),
    avgDailyCalories: 0,
  };
  const numDays = period === 'monthly' ? 30 : 7;
  caloriesReport.avgDailyCalories = Math.round(caloriesReport.totalConsumed / numDays);

  // Weight progress
  const weightProgress = {
    startWeight: weightLogs.length ? weightLogs[0].weight : null,
    currentWeight: weightLogs.length ? weightLogs[weightLogs.length - 1].weight : null,
    change: weightLogs.length ? Math.round((weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight) * 10) / 10 : 0,
    logs: weightLogs,
  };

  // Goal achievement
  const goalReport = {
    totalGoals: goals.length,
    completed: goals.filter((g) => g.status === 'completed').length,
    active: goals.filter((g) => g.status === 'active').length,
    goals: goals.map((g) => ({ ...g.toObject(), progressPercent: g.getProgressPercent() })),
  };

  res.json({
    success: true,
    data: {
      period,
      generatedAt: new Date(),
      rangeStart: startDate,
      workoutStats,
      caloriesReport,
      weightProgress,
      goalReport,
    },
  });
});

module.exports = { getReport };
