const config = require('config')
const cloudinary = require('cloudinary')

module.exports = function () {
  cloudinary.config({
    cloud_name: 'streetmix',
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
  })
}
