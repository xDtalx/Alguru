const mongoose = require('mongoose');

const socialSchema = mongoose.Schema({
  type: { type: String, required: true, unique: true },
  link: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Social', socialSchema);
