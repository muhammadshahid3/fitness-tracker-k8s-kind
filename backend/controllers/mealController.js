const Meal = require('../models/Meal');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get meals for logged-in user (filter, search, pagination)
// @route   GET /api/meals?mealType=&search=&startDate=&endDate=&page=&limit=
// @access  Private
const getMeals = asyncHandler(async (req, res) => {
  const { mealType, search, startDate, endDate, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (mealType) query.mealType = mealType;
  if (search) query.name = { $regex: search, $options: 'i' };
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [meals, total] = await Promise.all([
    Meal.find(query).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Meal.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: meals,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @desc    Get daily nutrition summary for a given date (defaults to today)
// @route   GET /api/meals/summary?date=
// @access  Private
const getDailySummary = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  const start = new Date(date.setHours(0, 0, 0, 0));
  const end = new Date(date.setHours(23, 59, 59, 999));

  const meals = await Meal.find({ user: req.user._id, date: { $gte: start, $lte: end } });

  const summary = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories;
      acc.protein += m.protein;
      acc.carbs += m.carbs;
      acc.fat += m.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  res.json({ success: true, data: { ...summary, meals } });
});

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
const createMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Meal added', data: meal });
});

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
  res.json({ success: true, message: 'Meal updated', data: meal });
});

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = asyncHandler(async (req, res) => {
  const meal = await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
  res.json({ success: true, message: 'Meal deleted' });
});

module.exports = { getMeals, getDailySummary, createMeal, updateMeal, deleteMeal };
