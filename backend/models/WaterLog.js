const mongoose = require('mongoose');

const WaterLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: [true, 'Amount (ml) is required'], min: 1 },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

WaterLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WaterLog', WaterLogSchema);
