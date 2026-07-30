const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getTodayWater, getWaterHistory, addWater, deleteWater, setWaterGoal } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/today', getTodayWater);
router.get('/history', getWaterHistory);
router.post('/', [body('amount').isFloat({ min: 1 }).withMessage('Amount must be a positive number')], validate, addWater);
router.put('/goal', [body('goal').isFloat({ min: 1 }).withMessage('Goal must be a positive number')], validate, setWaterGoal);
router.delete('/:id', deleteWater);

module.exports = router;
