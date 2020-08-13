const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const tmpTokenSchema = mongoose.Schema(
  {
    token: { type: String, required: true, unique: true }
  },
  {
    timestamps: true
  }
);

tmpTokenSchema.plugin(uniqueValidator);
module.exports = mongoose.model('TmpToken', tmpTokenSchema);
