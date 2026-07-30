const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight'],
    },
    title: { type: String, trim: true, default: '' },
    startValue: { type: Number, required: true }, // starting weight/metric
    targetValue: { type: Number, required: true }, // target weight/metric
    currentValue: { type: Number }, // latest known value, updated as user logs weight
    targetDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' },
  },
  { timestamps: true }
);

// Virtual: progress percentage towards goal
GoalSchema.methods.getProgressPercent = function () {
  const { startValue, targetValue, currentValue } = this;
  if (currentValue === undefined || currentValue === null) return 0;
  const totalDelta = targetValue - startValue;
  if (totalDelta === 0) return 100;
  const currentDelta = currentValue - startValue;
  const percent = (currentDelta / totalDelta) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
};

module.exports = mongoose.model('Goal', GoalSchema);
