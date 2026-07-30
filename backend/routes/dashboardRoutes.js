const express = require('express');
const router = express.Router();
const { getDashboard, getWeeklyProgress } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDashboard);
router.get('/weekly', getWeeklyProgress);

module.exports = router;
