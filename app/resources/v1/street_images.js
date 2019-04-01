const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()
const { SAVE_THUMBNAIL_EVENTS } = require('../../../lib/util.js')

const ALLOW_ANON_STREET_THUMBNAILS = false

exports.post = async function (req, res) {
  const json = JSON.parse(req.body)
  const { image, event } = json

  if (!image) {
    res.status(400).json({ status: 400, msg: 'Image data not specified.' })
    return
  }

  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }

  logger.info({ event, streetId: req.params.street_id }, 'Uploading street thumbnail.')

  if (event !== SAVE_THUMBNAIL_EVENTS.INITIAL) {
    res.status(412).json({ status: 412, msg: 'Only saving initial street rendered thumbnail.' })
    return
  }

  // 1) Check if street exists.
  let street

  try {
    street = await Street.findOne({ id: req.params.street_id })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding street.' })
  }

  if (!street) {
    res.status(404).json({ status: 404, msg: 'Street not found.' })
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
      res.status(400).json({ status: 400, msg: 'Please provide the public ID to be used.' })
      return
    }

    try {
      resource = await cloudinary.v2.uploader.upload(image, { public_id: publicId })
    } catch (error) {
      logger.error(error)
    }

    if (!resource) {
      res.status(500).json({ status: 500, msg: 'Error uploading street thumbnail.' })
      return
    }

    const thumbnail = {
      public_id: resource.public_id,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      secure_url: resource.secure_url,
      created_at: resource.created_at
    }

    res.status(201).json(thumbnail)
  }

  const handleFindStreetWithCreator = async function (street) {
    if (!req.userId) {
      res.status(401).json({ status: 401, msg: 'Please provide a user ID.' })
      return
    }

    let user

    try {
      user = await User.findOne({ id: req.userId })
    } catch (error) {
      logger.error(error)
      res.status(500).json({ status: 500, msg: 'Error finding user.' })
      return
    }

    if (!user) {
      res.status(403).json({ status: 403, msg: 'User not found.' })
      return
    }

    if (street.creator_id.toString() !== user._id.toString()) {
      res.status(403).json({ status: 403, msg: 'User does not have the right permissions to upload street thumbnail.' })
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
    res.status(403).json({ status: 403, msg: 'User does not have the right permissions to upload street thumbnail.' })
  }
}

exports.delete = async function (req, res) {
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide street ID.' })
    return
  }

  // 1) Verify user is logged in.
  const userId = req.userId

  if (!userId) {
    res.status(401).json({ status: 401, msg: 'Please provide user ID.' })
    return
  }

  let user

  try {
    user = await User.findOne({ id: userId })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding user.' })
  }

  if (!user) {
    res.status(404).json({ status: 404, msg: 'User not found.' })
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
    res.status(500).json({ status: 500, msg: 'Error finding street.' })
  }

  if (!street) {
    res.status(404).json({ status: 404, msg: 'Street not found.' })
    return
  } else if (street.creator_id.toString() !== user._id.toString()) {
    res.status(403).json({ status: 403, msg: 'Signed in user cannot delete street thumbnail.' })
    return
  }

  // 4) Delete street thumbnail from cloudinary.
  const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
  cloudinary.v2.uploader.destroy(publicId, function (error, result) {
    if (error) {
      logger.error(error)
      res.status(500).json({ status: 500, msg: 'Error deleting street thumbnail.' })
      return
    }

    res.status(204).end()
  })
}

exports.get = async function (req, res) {
  if (!req.params.street_id) {
    res.status(400).json({ status: 400, msg: 'Please provide a street id.' })
    return
  }

  let resource

  try {
    const publicId = `${config.env}/street_thumbnails/${req.params.street_id}`
    resource = await cloudinary.v2.api.resource(publicId)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding street thumbnail.' })
    return
  }

  if (!resource) {
    res.status(404).json({ status: 404, msg: 'Could not find street thumbnail.' })
    return
  }

  res.status(200).json(resource)
}
