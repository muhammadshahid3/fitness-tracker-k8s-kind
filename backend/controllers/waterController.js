const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get today's water logs + progress toward daily goal
// @route   GET /api/water/today
// @access  Private
const getTodayWater = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.setHours(0, 0, 0, 0));
  const end = new Date(now.setHours(23, 59, 59, 999));

  const logs = await WaterLog.find({ user: req.user._id, date: { $gte: start, $lte: end } }).sort({ date: 1 });
  const totalIntake = logs.reduce((sum, l) => sum + l.amount, 0);
  const goal = req.user.dailyWaterGoal || 2500;

  res.json({
    success: true,
    data: {
      logs,
      totalIntake,
      goal,
      progressPercent: Math.min(100, Math.round((totalIntake / goal) * 100)),
    },
  });
});

// @desc    Get water history (grouped by day) for charts
// @route   GET /api/water/history?days=7
// @access  Private
const getWaterHistory = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  startDate.setHours(0, 0, 0, 0);

  const logs = await WaterLog.find({ user: req.user._id, date: { $gte: startDate } }).sort({ date: 1 });

  const grouped = {};
  logs.forEach((log) => {
    const key = log.date.toISOString().split('T')[0];
    grouped[key] = (grouped[key] || 0) + log.amount;
  });

  res.json({ success: true, data: grouped });
});

// @desc    Add water intake entry
// @route   POST /api/water
// @access  Private
const addWater = asyncHandler(async (req, res) => {
  const log = await WaterLog.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Water intake logged', data: log });
});

// @desc    Delete water entry
// @route   DELETE /api/water/:id
// @access  Private
const deleteWater = asyncHandler(async (req, res) => {
  const log = await WaterLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!log) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, message: 'Water entry deleted' });
});

// @desc    Set daily water goal
// @route   PUT /api/water/goal
// @access  Private
const setWaterGoal = asyncHandler(async (req, res) => {
  const { goal } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { dailyWaterGoal: goal }, { new: true });
  res.json({ success: true, message: 'Daily water goal updated', data: { dailyWaterGoal: user.dailyWaterGoal } });
});

module.exports = { getTodayWater, getWaterHistory, addWater, deleteWater, setWaterGoal };
