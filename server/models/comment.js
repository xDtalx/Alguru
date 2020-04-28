const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  title:   { type: String, require: true },
  content: { type: String, require: true },
  postId : { type : String ,require: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true }
});

module.exports = mongoose.model('Comment', commentSchema);
