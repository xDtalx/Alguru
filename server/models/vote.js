const mongoose = require('mongoose');

const voteSchema = mongoose.Schema({
  username: { type: String, required: true },
  isUp: { type: Boolean, required: true },
  message: { type: String }
});

module.exports = mongoose.model('Vote', voteSchema);
