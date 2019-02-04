const cloudinary = require('cloudinary')
const config = require('config')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  const query = req.query

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
