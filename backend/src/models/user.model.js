const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    unique: true,
    required: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
  },
  profile_picture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  }
}, {
    timestamps: true
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;