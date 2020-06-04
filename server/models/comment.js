const mongoose = require('mongoose');
const Vote = require('./vote');

const commentSchema = mongoose.Schema({
  currentTitle: { type: String, require: true },
  currentContent: { type: String, require: true },
  currentDate: { type: Number, require: true },
  titles: [{ type: String, require: true }],
  contents: [{ type: String, require: true }],
  postId: { type: String, require: true },
  dates: [{ type: Number, require: true }],
  author: { type: String, require: true },
  votes: { type: Map, of: Vote.schema }
});

module.exports = mongoose.model('Comment', commentSchema);
