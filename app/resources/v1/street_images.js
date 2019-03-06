const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

exports.post = async function (req, res) {
  const image = req.body

  if (!image) {
    res.status(400).send('Image data not specified.')
    return
  }

  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  // 1) Verify user is logged in.
  const userId = req.userId

  if (!userId) {
    res.status(400).send('Please provide user ID.')
    return
  }

  let user

  try {
    user = await User.findOne({ id: userId })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not found.')
    return
  }

  // Is requesting user logged in?
  if (user.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  // 2) Check that street exists.
  // 3) Verify that street is owned by logged in user.
  let street

  try {
    street = await Street.findOne({ id: req.params.street_id })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street.')
  }

  if (!street) {
    res.status(400).send('Street not found.')
    return
  } else if (street.creator_id.toString() !== user._id.toString()) {
    res.status(404).send('Signed in user cannot upload street thumbnail.')
    return
  }

  // 4) Upload street thumbnail to cloudinary.
  let response

  try {
    const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
    response = await cloudinary.v2.uploader.upload(image, { public_id: publicId })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error uploading thumbnail to cloudinary.')
  }

  if (!response) {
    res.status(400).send('Could not upload thumbnail to cloudinary.')
    return
  }

  res.status(200).send('Successfully uploaded thumbnail to cloudinary.')
}

exports.delete = async function (req, res) {
  if (!req.params.street_id) {
    res.status(400).send('Please provide street ID.')
    return
  }

  // 1) Verify user is logged in.
  const userId = req.userId

  if (!userId) {
    res.status(400).send('Please provide user ID.')
    return
  }

  let user

  try {
    user = await User.findOne({ id: userId })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not found.')
    return
  }

  // Is requesting user logged in?
  if (user.login_tokens.indexOf(req.loginToken) === -1) {
    res.status(401).end()
    return
  }

  // 2) Check that street exists.
  // 3) Verify that street is owned by logged in user.
  let street

  try {
    street = await Street.findOne({ id: req.params.street_id })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street.')
  }

  if (!street) {
    res.status(400).send('Street not found.')
    return
  } else if (street.creator_id.toString() !== user._id.toString()) {
    res.status(404).send('Signed in user cannot delete street thumbnail.')
    return
  }

  // 4) Delete street thumbnail from cloudinary.
  const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
  cloudinary.v2.uploader.destroy(publicId, function (error, result) {
    if (error) {
      logger.error(error)
      res.status(500).send('Error deleting street thumbnail from cloudinary.')
      return
    }

    res.status(204).end()
  })
}

exports.get = async function (req, res) {
  if (!req.params.street_id) {
    res.status(400).send('Please provide a street id.')
    return
  }

  let thumbnail

  try {
    const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
    const resource = await cloudinary.v2.api.resource(publicId)
    thumbnail = resource && resource.secure_url
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street thumbnail from cloudinary.')
    return
  }

  if (!thumbnail) {
    res.status(400).send('Could not find street thumbnail from cloudinary.')
    return
  }

  res.status(200).send({ image: thumbnail })
}
