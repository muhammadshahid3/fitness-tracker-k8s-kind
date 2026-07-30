const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

const workoutValidation = [
  body('name').trim().notEmpty().withMessage('Workout name is required'),
  body('category').isIn(['Chest', 'Back', 'Legs', 'Cardio', 'Shoulder', 'Arms', 'Core']).withMessage('Invalid category'),
  body('duration').isFloat({ min: 1 }).withMessage('Duration must be a positive number'),
  body('caloriesBurned').isFloat({ min: 0 }).withMessage('Calories burned must be 0 or greater'),
];

router.get('/', getWorkouts);
router.get('/:id', getWorkout);
router.post('/', workoutValidation, validate, createWorkout);
router.put('/:id', updateWorkout);
router.delete('/:id', deleteWorkout);

module.exports = router;
