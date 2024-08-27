const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  },
  mobile: {
    type: String,
    required: true,
    match: /^\d{10}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    match: /(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
