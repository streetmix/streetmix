const mongoose = require('mongoose')

const sequenceSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 1 }
})

module.exports = mongoose.model('Sequence', sequenceSchema)
