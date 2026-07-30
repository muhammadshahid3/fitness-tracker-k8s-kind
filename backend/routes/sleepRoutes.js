const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getSleepLogs, getWeeklySleepReport, createSleepLog, updateSleepLog, deleteSleepLog } = require('../controllers/sleepController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getSleepLogs);
router.get('/weekly-report', getWeeklySleepReport);
router.post('/', [body('hours').isFloat({ min: 0, max: 24 }).withMessage('Hours must be between 0 and 24')], validate, createSleepLog);
router.put('/:id', updateSleepLog);
router.delete('/:id', deleteSleepLog);

module.exports = router;
