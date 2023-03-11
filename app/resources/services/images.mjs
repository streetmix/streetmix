import cloudinary from 'cloudinary'
import User from '../../db/models/user.js'
import logger from '../../lib/logger.js'

export async function get (req, res) {
  const query = req.query

  if (!req.auth?.sub) {
    res.status(401).json({ status: 401, msg: 'Please provide user ID.' })
    return
  }

  let user

  try {
    user = await User.findOne({ where: { auth0_id: req.auth.sub } })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding user.' })
    return
  }

  if (!user) {
    res.status(403).json({ status: 403, msg: 'User not found.' })
    return
  }

  // Is requesting user logged in?
  if (!req.auth?.sub || req.auth.sub !== user.id) {
    res.status(401).end()
    return
  }

  // If requesting user is logged in, permission granted to receive cloudinary signature.
  let signature
  try {
    signature = await cloudinary.utils.api_sign_request(
      query,
      process.env.CLOUDINARY_API_SECRET
    )
  } catch (error) {
    logger.error(error)
  }

  if (!signature) {
    res.status(500).json({ status: 500, msg: 'Error generating signature.' })
    return
  }

  const payload = {
    signature,
    timestamp: query.timestamp,
    api_key: process.env.CLOUDINARY_API_KEY
  }

  res.status(200).json(payload)
}
