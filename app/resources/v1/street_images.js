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

  // 1) Check if street thumbnail exists on Cloudinary.
  const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
  let thumbnail

  try {
    const resource = await cloudinary.v2.api.resource(publicId)
    thumbnail = resource && resource.secure_url
  } catch (error) {
    logger.error(error)
  }

  const handleErrors = function (error) {
    logger.error(error)
    res.status(500).end()
  }

  const handleUploadStreetThumbnail = async function (streetId) {
    let resource

    try {
      const publicId = `${config.env}/street_thumbnails/${streetId}`
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

  // 2a) If street thumbnail does not exist, upload automatically to Cloudinary regardless of creator.
  if (!thumbnail) {
    handleUploadStreetThumbnail(req.params.street_id)
    return
  }

  // 2b) If street thumbnail does exist, verify that street exists.
  let street

  try {
    street = Street.findOne({ id: req.params.street_id })
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error finding street.')
    return
  }

  if (!street) {
    res.status(400).send('Street not found.')
    return
  }

  const handleFindStreetWithCreatorId = async function (street, userId) {
    if (!userId) {
      res.status(400).send('Please provide a user id.')
      return
    }

    let user

    try {
      user = await User.findOne({ id: userId })
    } catch (error) {
      logger.error(error)
      res.status(500).send('Error finding user.')
      return
    }

    if (!user) {
      res.status(400).send('User not found.')
      return
    }

    // Verify user is signed in.
    if (user.login_tokens.indexOf(req.loginToken) === -1) {
      res.status(401).end()
      return
    }

    // Verify user is owner of street.
    if (street.creator_id !== user._id) {
      res.status(404).send('User does not have right permissions to upload street thumbnail to Cloudinary.')
      return
    }

    return req.params.street_id
  }

  // 3a) If street was created by a user, verify that signed in user is the street owner before uploading street thumbnail to Cloudinary.
  // 3b) If street was created anonymously, upload street thumbnail to Cloudinary
  if (street.creator_id) {
    handleFindStreetWithCreatorId(street, req.userId)
      .then(handleUploadStreetThumbnail)
      .catch(handleErrors)
  } else {
    handleUploadStreetThumbnail(req.params.street_id)
      .catch(handleErrors)
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
