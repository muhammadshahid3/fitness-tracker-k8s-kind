const SleepLog = require('../models/SleepLog');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get sleep logs (paginated)
// @route   GET /api/sleep?page=&limit=
// @access  Private
const getSleepLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [logs, total] = await Promise.all([
    SleepLog.find({ user: req.user._id }).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    SleepLog.countDocuments({ user: req.user._id }),
  ]);

  res.json({ success: true, data: logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Weekly sleep report (last 7 days)
// @route   GET /api/sleep/weekly-report
// @access  Private
const getWeeklySleepReport = asyncHandler(async (req, res) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const logs = await SleepLog.find({ user: req.user._id, date: { $gte: startDate } }).sort({ date: 1 });
  const avgHours = logs.length ? logs.reduce((sum, l) => sum + l.hours, 0) / logs.length : 0;

  res.json({ success: true, data: { logs, avgHours: Math.round(avgHours * 10) / 10 } });
});

// @desc    Add sleep entry
// @route   POST /api/sleep
// @access  Private
const createSleepLog = asyncHandler(async (req, res) => {
  const log = await SleepLog.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, message: 'Sleep logged', data: log });
});

// @desc    Update sleep entry
// @route   PUT /api/sleep/:id
// @access  Private
const updateSleepLog = asyncHandler(async (req, res) => {
  const log = await SleepLog.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!log) return res.status(404).json({ success: false, message: 'Sleep entry not found' });
  res.json({ success: true, message: 'Sleep entry updated', data: log });
});

// @desc    Delete sleep entry
// @route   DELETE /api/sleep/:id
// @access  Private
const deleteSleepLog = asyncHandler(async (req, res) => {
  const log = await SleepLog.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!log) return res.status(404).json({ success: false, message: 'Sleep entry not found' });
  res.json({ success: true, message: 'Sleep entry deleted' });
});

module.exports = { getSleepLogs, getWeeklySleepReport, createSleepLog, updateSleepLog, deleteSleepLog };
