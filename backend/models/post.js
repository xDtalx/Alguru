const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: { type: String, require: true },
  content: { type: String, require: true },
  //undefined will help us to deal with empty array - will make it undefined by default
  commentsArray: {type: Array, default: undefined , require: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true }
});

module.exports = mongoose.model('Post', postSchema);
