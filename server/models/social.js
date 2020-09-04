const mongoose = require('mongoose');

const socialSchema = mongoose.Schema({
  type: { type: String, required: true, unique: true },
  url: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Social', socialSchema);
