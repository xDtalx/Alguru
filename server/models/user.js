const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  username: { type: String, require: true, unique: true },
  username_lower: { type: String, unique: true },
  email: { type: String, require: true, unique: true },
  hashedPassword: { type: String, require: true },
  numberOfSolvedQuestoins: { type : Number },
  isAdmin: { type: Boolean, require: true }
});

// adding a plugin so we'd get an error when username and email already exists
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
