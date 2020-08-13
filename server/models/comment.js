const mongoose = require('mongoose');
const Vote = require('./vote');

const commentSchema = mongoose.Schema({
  currentTitle: { type: String },
  currentContent: { type: String, required: true },
  currentDate: { type: Number, required: true },
  titles: [{ type: String }],
  contents: [{ type: String, required: true }],
  postId: { type: String, required: true },
  dates: [{ type: Number, required: true }],
  author: { type: String, required: true },
  votes: { type: Map, of: Vote.schema }
});

module.exports = mongoose.model('Comment', commentSchema);
