const mongoose = require('mongoose');

const SleepLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hours: { type: Number, required: [true, 'Sleep hours is required'], min: 0, max: 24 },
    quality: {
      type: String,
      enum: ['Poor', 'Fair', 'Good', 'Excellent'],
      default: 'Good',
    },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

SleepLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('SleepLog', SleepLogSchema);
