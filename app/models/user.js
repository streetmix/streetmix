var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
  id: { type: String, index: { unique: true } },
  twitter_id: String,
  twitter_credentials: mongoose.Schema.Types.Mixed,
  login_tokens: [ String ],
  data: mongoose.Schema.Types.Mixed,
  created_at: Date,
  updated_at: Date,
  last_street_id: Number
})

userSchema.pre('save', function(next) {
  var now = new Date()
  this.updated_at = now
  this.created_at = this.created_at || now
  next()
})

userSchema.methods.asJson = function(options, cb) {
  options = options || {}

  var json = {
    id: this.id
  }

  if (options.auth) {
    json.data = this.data
    json.createdAt = this.created_at
    json.updatedAt = this.updated_at
  }

  cb(null, json)
}

module.exports = mongoose.model('User', userSchema)
