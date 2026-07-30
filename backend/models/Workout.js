const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Workout name is required'], trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Chest', 'Back', 'Legs', 'Cardio', 'Shoulder', 'Arms', 'Core'],
    },
    duration: { type: Number, required: [true, 'Duration (minutes) is required'], min: 1 },
    caloriesBurned: { type: Number, required: [true, 'Calories burned is required'], min: 0 },
    notes: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

WorkoutSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Workout', WorkoutSchema);
