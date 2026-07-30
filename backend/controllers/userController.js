const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'age',
    'gender',
    'height',
    'weight',
    'goalWeight',
    'fitnessGoal',
    'activityLevel',
    'dailyCalorieGoal',
    'dailyWaterGoal',
    'notificationPrefs',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, message: 'Profile updated successfully', user });
});

// @desc    Upload / update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
const updateProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const filePath = `/uploads/profile-pictures/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { profilePicture: filePath },
    { new: true }
  );

  res.json({ success: true, message: 'Profile picture updated', user });
});

module.exports = { updateProfile, updateProfilePicture };
