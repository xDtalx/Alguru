const mongoose = require('mongoose');

const notifactionSchema = mongoose.Schema(
  {
    content: { type: String, require: true },
    seen: { type: Boolean, require: true },
    sender: { type: String, require: true },
    title: { type: String, require: true },
    url: { type: String, require: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('Notification', notifactionSchema);
