const mongoose = require('mongoose');
const Comment = require('./comment');

const postSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  comments: { type: Map, of: Comment.schema },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true },
});

module.exports = mongoose.model('Post', postSchema);
