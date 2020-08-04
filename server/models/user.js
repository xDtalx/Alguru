const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Question = require('./question');


const userSchema = mongoose.Schema({
  username: { type: String, require: true, unique: true },
  username_lower: { type: String, unique: true },
  email: { type: String, require: true, unique: true },
  hashedPassword: { type: String, require: true },
  solvedQuestions: { type: Map, of: String },
  isAdmin: { type: Boolean, require: true }
});


// to decide which type will be the set
// adding a plugin so we'd get an error when username and email already exists
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
