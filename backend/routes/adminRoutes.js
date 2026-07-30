const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, deleteUser, toggleBlockUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/block', toggleBlockUser);

module.exports = router;
