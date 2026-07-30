const WeightLog = require('../models/WeightLog');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get weight history for logged-in user
// @route   GET /api/weight?page=&limit=
// @access  Private
const getWeightLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    WeightLog.find({ user: req.user._id }).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    WeightLog.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Add a weight entry (also updates user's current weight + goal progress)
// @route   POST /api/weight
// @access  Private
const createWeightLog = asyncHandler(async (req, res) => {
  const log = await WeightLog.create({ ...req.body, user: req.user._id });

  // Keep the user's "current weight" snapshot in sync with the latest log
  const latest = await WeightLog.findOne({ user: req.user._id }).sort({ date: -1 });
  if (latest && String(latest._id) === String(log._id)) {
    await User.findByIdAndUpdate(req.user._id, { weight: log.weight });
  }

  res.status(201).json({ success: true, message: 'Weight logged', data: log });
});

// @desc    Update a weight entry
// @route   PUT /api/weight/:id
// @access  Private
const updateWeightLog = asyncHandler(async (req, res) => {
  const log = await WeightLog.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!log) return res.status(404).json({ success: false, message: 'Weight entry not found' });
  res.json({ success: true, message: 'Weight entry updated', data: log });
});

// @desc    Delete a weight entry
// @route   DELETE /api/weight/:id
// @access  Private
const deleteWeightLog = asyncHandler(async (req, res) => {
  const log = await WeightLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!log) return res.status(404).json({ success: false, message: 'Weight entry not found' });
  res.json({ success: true, message: 'Weight entry deleted' });
});

// @desc    Goal progress percentage based on start weight -> goal weight
// @route   GET /api/weight/goal-progress
// @access  Private
const getGoalProgress = asyncHandler(async (req, res) => {
  const user = req.user;
  const firstLog = await WeightLog.findOne({ user: req.user._id }).sort({ date: 1 });
  const latestLog = await WeightLog.findOne({ user: req.user._id }).sort({ date: -1 });

  if (!user.goalWeight || !firstLog || !latestLog) {
    return res.json({ success: true, data: { progressPercent: 0, message: 'Set a goal weight and log your weight to see progress' } });
  }

  const startWeight = firstLog.weight;
  const currentWeight = latestLog.weight;
  const totalDelta = user.goalWeight - startWeight;
  let progressPercent = 0;
  if (totalDelta !== 0) {
    progressPercent = Math.round(((currentWeight - startWeight) / totalDelta) * 100);
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  } else {
    progressPercent = 100;
  }

  res.json({
    success: true,
    data: { startWeight, currentWeight, goalWeight: user.goalWeight, progressPercent },
  });
});

module.exports = { getWeightLogs, createWeightLog, updateWeightLog, deleteWeightLog, getGoalProgress };
