const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getMeals, getDailySummary, createMeal, updateMeal, deleteMeal } = require('../controllers/mealController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

const mealValidation = [
  body('mealType').isIn(['Breakfast', 'Lunch', 'Dinner', 'Snacks']).withMessage('Invalid meal type'),
  body('name').trim().notEmpty().withMessage('Meal name is required'),
  body('calories').isFloat({ min: 0 }).withMessage('Calories must be 0 or greater'),
];

router.get('/', getMeals);
router.get('/summary', getDailySummary);
router.post('/', mealValidation, validate, createMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);

module.exports = router;
