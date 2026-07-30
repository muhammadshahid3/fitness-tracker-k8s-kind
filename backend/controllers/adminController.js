const User = require('../models/User');
const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Goal = require('../models/Goal');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Admin dashboard: system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = asyncHandler(async (req, res) => {
  const [totalUsers, blockedUsers, totalWorkouts, totalMeals, totalGoals, newUsersThisWeek] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', isBlocked: true }),
    Workout.countDocuments(),
    Meal.countDocuments(),
    Goal.countDocuments(),
    User.countDocuments({ role: 'user', createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  res.json({
    success: true,
    data: { totalUsers, blockedUsers, activeUsers: totalUsers - blockedUsers, totalWorkouts, totalMeals, totalGoals, newUsersThisWeek },
  });
});

// @desc    Get all users (paginated, searchable)
// @route   GET /api/admin/users?search=&page=&limit=
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 15 } = req.query;
  const query = { role: 'user' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

// @desc    Block or unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, data: user });
});

module.exports = { getSystemStats, getAllUsers, deleteUser, toggleBlockUser };
