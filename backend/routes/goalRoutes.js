const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

const goalValidation = [
  body('type').isIn(['weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight']).withMessage('Invalid goal type'),
  body('startValue').isFloat().withMessage('Start value is required'),
  body('targetValue').isFloat().withMessage('Target value is required'),
  body('targetDate').isISO8601().withMessage('Valid target date is required'),
];

router.get('/', getGoals);
router.post('/', goalValidation, validate, createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

module.exports = router;
