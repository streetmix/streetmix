const { User } = require('../../db/models')
const logger = require('../../../lib/logger.js')()

exports.delete = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).json({ status: 400, msg: 'Please provide user ID.' })
    return
  }

  const userId = req.params.user_id

  let user

  try {
    user = await User.findOne({ where: { id: userId } })
  } catch (err) {
    logger.error(err)
    console.log('DOOR 1')
    res.status(500).json({ status: 500, msg: 'Error finding user.' })
  }

  if (!user) {
    res.status(404).json({ status: 404, msg: 'User not found.' })
    return
  }

  const idx = user.loginTokens.indexOf(req.loginToken)
  if (idx === -1) {
    res.status(401).end()
    return
  }
  user.loginTokens.splice(idx, 1)

  user
    .save()
    .then((user) => {
      res.status(204).end()
    })
    .catch((err) => {
      logger.error(err)
      res.status(500).json({ status: 500, msg: 'Could not sign-out user.' })
    })
} // END function - exports.delete
