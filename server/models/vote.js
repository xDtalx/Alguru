const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
  username: { type: String, require: true },
  isUp: { type: Boolean, require: true },
  message: {type: String }
});

module.exports = mongoose.model('Vote', voteSchema);
