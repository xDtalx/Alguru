const mongoose = require('mongoose');
const Notification = require('./notification');
const Stats = require('./stats');
const Social = require('./social');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  username_lower: { type: String, required: true, unique: true },
  email: { type: String, reqrequireduire: true, unique: true },
  hashedPassword: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
  notifications: [Notification.schema],
  verified: { type: Boolean, required: true },
  stats: { type: Stats.schema, required: true },
  socials: [Social.schema]
});

// to decide which type will be the set
// adding a plugin so we'd get an error when username and email already exists
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
