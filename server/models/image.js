const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Image', imageSchema);
