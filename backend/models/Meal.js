const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mealType: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    },
    name: { type: String, required: [true, 'Meal name is required'], trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0, default: 0 }, // grams
    carbs: { type: Number, required: true, min: 0, default: 0 }, // grams
    fat: { type: Number, required: true, min: 0, default: 0 }, // grams
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

MealSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Meal', MealSchema);
