const mongoose = require('mongoose');
const Comment = require('./comment');
const Vote = require('./vote');

const postSchema = mongoose.Schema({
  currentTitle: { type: String, required: true },
  currentContent: { type: String, required: true },
  currentDate: { type: Number, required: true },
  titles: [{ type: String, required: true }],
  contents: [{ type: String, required: true }],
  comments: [Comment.schema],
  dates: [{ type: Number, required: true }],
  author: { type: String, required: true },
  votes: { type: Map, of: Vote.schema, required: true }
});

module.exports = mongoose.model('Post', postSchema);
