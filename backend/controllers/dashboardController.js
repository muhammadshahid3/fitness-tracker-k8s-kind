const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const SleepLog = require('../models/SleepLog');
const asyncHandler = require('../middleware/asyncHandler');

const startOfDay = (d = new Date()) => new Date(new Date(d).setHours(0, 0, 0, 0));
const endOfDay = (d = new Date()) => new Date(new Date(d).setHours(23, 59, 59, 999));

// Calculates BMI given height (cm) and weight (kg)
const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
};

const bmiCategory = (bmi) => {
  if (bmi === null) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

// @desc    Get all dashboard summary data in one call
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const user = req.user;
  const today = { $gte: startOfDay(), $lte: endOfDay() };

  const [todaysWorkouts, todaysMeals, todaysWater, latestWeight] = await Promise.all([
    Workout.find({ user: user._id, date: today }),
    Meal.find({ user: user._id, date: today }),
    WaterLog.find({ user: user._id, date: today }),
    WeightLog.findOne({ user: user._id }).sort({ date: -1 }),
  ]);

  const caloriesBurned = todaysWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
  const caloriesConsumed = todaysMeals.reduce((sum, m) => sum + m.calories, 0);
  const waterIntake = todaysWater.reduce((sum, w) => sum + w.amount, 0);
  const currentWeight = latestWeight ? latestWeight.weight : user.weight;

  const bmi = calculateBMI(user.height, currentWeight);

  // Simple fitness score (0-100): blends calorie goal adherence, water goal,
  // and whether a workout was logged today. Purely a motivational heuristic.
  let fitnessScore = 0;
  const calorieGoal = user.dailyCalorieGoal || 2000;
  const calorieAdherence = calorieGoal > 0 ? Math.max(0, 1 - Math.abs(caloriesConsumed - calorieGoal) / calorieGoal) : 0;
  const waterGoalRatio = Math.min(1, waterIntake / (user.dailyWaterGoal || 2500));
  const workoutBonus = todaysWorkouts.length > 0 ? 1 : 0;
  fitnessScore = Math.round((calorieAdherence * 40 + waterGoalRatio * 30 + workoutBonus * 30));
  fitnessScore = Math.max(0, Math.min(100, fitnessScore));

  res.json({
    success: true,
    data: {
      caloriesConsumed,
      caloriesBurned,
      waterIntake,
      waterGoal: user.dailyWaterGoal || 2500,
      currentWeight: currentWeight || null,
      goalWeight: user.goalWeight || null,
      bmi,
      bmiCategory: bmiCategory(bmi),
      fitnessScore,
      todaysWorkouts,
      workoutCount: todaysWorkouts.length,
      calorieGoal,
    },
  });
});

// @desc    Weekly progress chart data (last 7 days): calories in/out, water, weight
// @route   GET /api/dashboard/weekly
// @access  Private
const getWeeklyProgress = asyncHandler(async (req, res) => {
  const days = 7;
  const startDate = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

  const [workouts, meals, water, weights, sleep] = await Promise.all([
    Workout.find({ user: req.user._id, date: { $gte: startDate } }),
    Meal.find({ user: req.user._id, date: { $gte: startDate } }),
    WaterLog.find({ user: req.user._id, date: { $gte: startDate } }),
    WeightLog.find({ user: req.user._id, date: { $gte: startDate } }).sort({ date: 1 }),
    SleepLog.find({ user: req.user._id, date: { $gte: startDate } }),
  ]);

  const labels = [];
  const caloriesBurned = [];
  const caloriesConsumed = [];
  const waterIntake = [];
  const sleepHours = [];

  for (let i = 0; i < days; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const key = dayStart.toISOString().split('T')[0];
    labels.push(key);

    caloriesBurned.push(
      workouts.filter((w) => w.date >= dayStart && w.date <= dayEnd).reduce((s, w) => s + w.caloriesBurned, 0)
    );
    caloriesConsumed.push(
      meals.filter((m) => m.date >= dayStart && m.date <= dayEnd).reduce((s, m) => s + m.calories, 0)
    );
    waterIntake.push(water.filter((w) => w.date >= dayStart && w.date <= dayEnd).reduce((s, w) => s + w.amount, 0));
    sleepHours.push(sleep.filter((s) => s.date >= dayStart && s.date <= dayEnd).reduce((s, l) => s + l.hours, 0));
  }

  res.json({
    success: true,
    data: {
      labels,
      caloriesBurned,
      caloriesConsumed,
      waterIntake,
      sleepHours,
      weightTrend: weights.map((w) => ({ date: w.date, weight: w.weight })),
    },
  });
});

module.exports = { getDashboard, getWeeklyProgress, calculateBMI, bmiCategory };
