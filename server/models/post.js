const mongoose = require('mongoose');
const Comment = require('./comment');
const Vote = require('./vote');

const postSchema = mongoose.Schema({
  currentTitle: { type: String, require: true },
  currentContent: { type: String, require: true },
  currentDate: { type: Number, require: true },
  titles: [{ type: String, require: true }],
  contents: [{ type: String, require: true }],
  comments: [Comment.schema],
  dates: [{ type: Number, require: true }],
  author: { type: String, require: true },
  votes: { type: Map, of: Vote.schema }
});

module.exports = mongoose.model('Post', postSchema);
