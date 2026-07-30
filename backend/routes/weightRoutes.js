const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getWeightLogs, createWeightLog, updateWeightLog, deleteWeightLog, getGoalProgress } = require('../controllers/weightController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getWeightLogs);
router.get('/goal-progress', getGoalProgress);
router.post('/', [body('weight').isFloat({ min: 0 }).withMessage('Weight must be a positive number')], validate, createWeightLog);
router.put('/:id', updateWeightLog);
router.delete('/:id', deleteWeightLog);

module.exports = router;
