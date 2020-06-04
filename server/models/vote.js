const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
  username: { type: String, require: true },
  isUp: { type: Boolean, require: true }
});

module.exports = mongoose.model('Vote', voteSchema);
