const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weight: { type: Number, required: [true, 'Weight is required'], min: 0 }, // kg
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

WeightLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WeightLog', WeightLogSchema);
