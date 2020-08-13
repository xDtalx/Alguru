const mongoose = require('mongoose');

const notifactionSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    seen: { type: Boolean, required: true },
    sender: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model('Notification', notifactionSchema);
