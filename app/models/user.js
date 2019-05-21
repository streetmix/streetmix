const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  id: { type: String, index: { unique: true } },
  twitter_id: String,
  twitter_credentials: mongoose.Schema.Types.Mixed,
  auth0_id: String,
  email: { type: String, index: { unique: true, sparse: true } },
  login_tokens: [ String ],
  profile_image_url: String,
  data: mongoose.Schema.Types.Mixed,
  created_at: Date,
  updated_at: Date,
  last_street_id: Number,
  flags: mongoose.Schema.Types.Mixed,
  roles: [ String ]
})

userSchema.pre('save', function (next) {
  const now = new Date()
  this.updated_at = now
  this.created_at = this.created_at || now
  next()
})

userSchema.methods.asJson = function (options, cb) {
  options = options || {}

  const json = {
    id: this.id
  }

  if (options.auth) {
    json.data = this.data
    json.createdAt = this.created_at
    json.updatedAt = this.updated_at
    json.flags = this.flags
    json.roles = this.roles
  }

  cb(null, json)
}
module.exports = mongoose.model('User', userSchema)
