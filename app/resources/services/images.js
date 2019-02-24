const cloudinary = require('cloudinary')
const config = require('config')
const User = require('../../models/user.js')
const Street = require('../../models/street.js')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  const query = req.query
  const userId = req.userId

  if (!userId) {
    res.status(400).send('Please provide user ID.')
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

  // If requesting user is logged in, permission granted to receive cloudinary signature.
  let signature
  try {
    signature = await cloudinary.utils.api_sign_request(query, config.cloudinary.api_secret)
  } catch (error) {
    logger.error(error)
    res.status(500).send('Error generating signature.')
  }

  if (!signature) {
    res.status(404).send('Signature could not be generated.')
  }

  const payload = {
    signature: signature,
    timestamp: query.timestamp,
    api_key: config.cloudinary.api_key
  }

  res.status(200).json(payload)
}

exports.post = async function (req, res) {
  let body

  if (req.body) {
    try {
      body = req.body
    } catch (e) {
      res.status(400).send('Could not parse body as JSON.')
      return
    }
  } else {
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
    response = await cloudinary.v2.uploader.upload(body.image, { public_id: publicId })
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
