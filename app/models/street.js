const mongoose = require('mongoose')
const async = require('async')
const User = require('./user.js')

const streetSchema = new mongoose.Schema({
  id: { type: String, index: { unique: true } },
  namespaced_id: { type: Number, index: true },
  status: { type: String, enum: [ 'ACTIVE', 'DELETED' ], default: 'ACTIVE' },
  name: String,
  creator_id: {
    type: mongoose.Schema.ObjectId,
    ref: mongoose.model('User'),
    index: true
  },
  data: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, index: true },
  updated_at: { type: Date, index: true },
  creator_ip: String
})

streetSchema.add({
  original_street_id: {
    type: mongoose.Schema.ObjectId,
    ref: 'Street'
  }
})

streetSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  this.created_at = this.created_at || now
  next()
})

streetSchema.methods.asJson = function (cb) {
  const json = {
    id: this.id,
    namespacedId: this.namespaced_id,
    name: this.name,
    data: this.data,
    createdAt: this.created_at,
    updatedAt: this.updated_at
  }

  const creatorId = this.creator_id
  const originalStreetId = this.original_street_id

  const appendCreator = function (callback) {
    if (creatorId) {
      User.findById(creatorId, function (err, creator) {
        if (err) {
          callback(err)
        } else {
          creator.asJson(null, function (err, creatorJson) {
            if (err) {
              callback(err)
            } else {
              json.creator = creatorJson
              callback()
            } // END else
          })
        } // END else
      })
    } else {
      callback()
    }
  } // END function - appendCreator

  const appendOriginalStreetId = function (callback) {
    if (originalStreetId) {
      mongoose.model('Street').findById(originalStreetId, function (err, originalStreet) {
        if (err) {
          callback(err)
        } else {
          json.originalStreetId = originalStreet.id
          callback()
        } // END else
      })
    } else {
      callback()
    }
  } // END function - appendOriginalStreetId

  async.parallel([
    appendCreator,
    appendOriginalStreetId
  ], function (err) {
    cb(err, json)
  })
}

module.exports = mongoose.model('Street', streetSchema)
