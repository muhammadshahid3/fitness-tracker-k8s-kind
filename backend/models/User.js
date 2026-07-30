const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBlocked: { type: Boolean, default: false },

    // Profile fields
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg (current weight snapshot)
    goalWeight: { type: Number },
    fitnessGoal: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_gain', 'maintain_weight', ''],
      default: '',
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active', ''],
      default: '',
    },
    profilePicture: { type: String, default: '' },

    // Daily goals
    dailyCalorieGoal: { type: Number, default: 2000 },
    dailyWaterGoal: { type: Number, default: 2500 }, // ml

    // Password reset
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // Notification preferences
    notificationPrefs: {
      workoutReminder: { type: Boolean, default: true },
      waterReminder: { type: Boolean, default: true },
      goalAchievement: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never leak sensitive fields in JSON responses
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
