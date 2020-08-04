const mongoose = require('mongoose');
const Vote = require('./vote');

const questionSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  solutionTemplate: [String],
  solution: [String],
  tests: [String],
  hints: { type: String },
  level: { type: Number, require: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
  votes: { type: Map, of: Vote.schema }
});

module.exports = mongoose.model('Question', questionSchema);
