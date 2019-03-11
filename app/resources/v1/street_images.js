const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

const ALLOW_ANON_STREET_THUMBNAILS = true

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

  // 1) Check if street exists.
  let street

  try {
    street = await Street.findOne({ id: req.params.street_id })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street.')
    return
  }

  if (!street) {
    res.status(400).send('Street not found.')
    return
  }

  // 2) Check if street thumbnail exists.
  let resource
  const publicId = `${config.env}/street_thumbnails/${street.id}`

  try {
    resource = cloudinary.v2.api.resource(publicId)
  } catch (error) {
    logger.error(error)
  }

  const handleUploadStreetThumbnail = async function (publicId) {
    if (!publicId) {
      res.status(400).send('Please provide the public ID to be used.')
      return
    }

    try {
      resource = await cloudinary.v2.uploader.upload(image, { public_id: publicId })
    } catch (error) {
      logger.error(error)
    }

    if (!resource) {
      res.status(500).send('Error uploading street thumbnail to Cloudinary.')
      return
    }

    res.status(200).json(resource)
  }

  const handleFindStreetWithCreator = async function (street) {
    if (!req.userId) {
      res.status(404).send('Please provide a user ID.')
      return
    }

    let user

    try {
      user = await User.findOne({ id: req.userId })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error finding user.')
      return
    }

    if (!user) {
      res.status(400).send('User not found.')
      return
    }

    if (street.creator_id !== user._id) {
      res.status(404).send('User does not have right permissions to upload street thumbnail.')
      return
    }

    const publicId = `${config.env}/street_thumbnails/${street.id}`
    return publicId
  }

  const handleError = function (error) {
    logger.error(error)
    res.status(500).end()
  }

  // 3a) If street thumbnail does not exist, upload to Cloudinary no matter the currently signed in user.
  // 3b) If street was created by anonymous user, upload to Cloudinary.
  if (!resource || (!street.creator_id && ALLOW_ANON_STREET_THUMBNAILS)) {
    handleUploadStreetThumbnail(publicId)
      .catch(handleError)
  } else if (street.creator_id) {
    // 3c) If street thumbnail already exists and street was created by a user, check if signed in user = creator.
    handleFindStreetWithCreator(street)
      .then(handleUploadStreetThumbnail)
      .catch(handleError)
  } else {
    res.status(400).send('User does not have the right permissions to upload street thumbnail to Cloudinary.')
  }
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

  let resource

  try {
    const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
    resource = await cloudinary.v2.api.resource(publicId)
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street thumbnail from cloudinary.')
    return
  }

  if (!resource) {
    res.status(400).send('Could not find street thumbnail from cloudinary.')
    return
  }

  res.status(200).json(resource)
}
