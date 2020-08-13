const mongoose = require('mongoose');

const statsSchema = mongoose.Schema({
  solvedQuestions: { type: Map, of: Boolean, default: {} },
  contribPoints: { type: Number, default: 0 },
  contribProblems: { type: Number, default: 0 },
  contribComments: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', statsSchema);
