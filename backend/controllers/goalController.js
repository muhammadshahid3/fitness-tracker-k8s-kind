const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all goals for logged-in user
// @route   GET /api/goals?status=
// @access  Private
const getGoals = asyncHandler(async (req, res) => {
  const query = { user: req.user._id };
  if (req.query.status) query.status = req.query.status;

  const goals = await Goal.find(query).sort({ createdAt: -1 });
  const withProgress = goals.map((g) => ({ ...g.toObject(), progressPercent: g.getProgressPercent() }));

  res.json({ success: true, data: withProgress });
});

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...req.body, user: req.user._id, currentValue: req.body.startValue });
  res.status(201).json({ success: true, message: 'Goal created', data: goal });
});

// @desc    Update a goal (progress, target, status, etc.)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

  // Auto-complete + notify when target reached
  const progress = goal.getProgressPercent();
  if (progress >= 100 && goal.status === 'active') {
    goal.status = 'completed';
    await goal.save();
    await Notification.create({
      user: req.user._id,
      type: 'goal_achievement',
      title: 'Goal achieved! 🎉',
      message: `You've reached your goal: ${goal.title || goal.type}`,
    });
  }

  res.json({ success: true, message: 'Goal updated', data: goal });
});

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
  res.json({ success: true, message: 'Goal deleted' });
});

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
