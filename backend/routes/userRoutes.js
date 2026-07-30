const express = require('express');
const router = express.Router();
const { updateProfile, updateProfilePicture } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/profile', protect, updateProfile);
router.put('/profile-picture', protect, upload.single('profilePicture'), updateProfilePicture);

module.exports = router;
