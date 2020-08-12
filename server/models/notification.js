const mongoose = require('mongoose');

const notifactionSchema = mongoose.Schema(
    {
      sender : {type: String , require: true},
      message : {type: String, require: true},
      isViewed : {type:Boolean, require: true}
    } 
  );

module.exports = mongoose.model('Notification', notifactionSchema);
