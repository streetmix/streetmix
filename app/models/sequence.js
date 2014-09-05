var mongoose = require('mongoose')

var sequenceSchema = new mongoose.Schema({
  _id: { type: String, index: { unique: true } },
  seq: { type: Number, default: 1 }
})

module.exports = mongoose.model('Sequence', sequenceSchema)
