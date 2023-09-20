const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: 'Invalid email format',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  hosId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the place's ID
    ref: 'Hostel'
  },
  resId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the place's ID
    ref: 'Restaurant'
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailToken: {type: String, unique: true},
  resetToken: String,
  resetTokenExpiresAt: Date,
});





const User = mongoose.model('User', userSchema);

module.exports = User;
