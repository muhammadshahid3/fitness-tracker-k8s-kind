const Workout = require('../models/Workout');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get workouts for logged-in user (supports filter, search, pagination)
// @route   GET /api/workouts?category=&search=&startDate=&endDate=&page=&limit=
// @access  Private
const getWorkouts = asyncHandler(async (req, res) => {
  const { category, search, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (category) query.category = category;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [workouts, total] = await Promise.all([
    Workout.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Workout.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: workouts,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
  if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
  res.json({ success: true, data: workout });
});

// @desc    Create workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Workout added', data: workout });
});

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
  res.json({ success: true, message: 'Workout updated', data: workout });
});

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
  res.json({ success: true, message: 'Workout deleted' });
});

module.exports = { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout };
