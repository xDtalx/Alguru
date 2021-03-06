const mongoose = require('mongoose');
const Vote = require('./vote');

const questionSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  solutionTemplate: [String],
  solution: [String],
  exampleTests: [String],
  submitionTests: [String],
  hints: { type: String },
  level: { type: Number, required: true },
  author: { type: String, required: true },
  votes: { type: Map, of: Vote.schema, required: true }
});

module.exports = mongoose.model('Question', questionSchema);
