const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  solution: { type: String, require: true },
  hints: { type: String },
  level: { type: Number, require: true}
});

module.exports = mongoose.model('Question', questionSchema);
