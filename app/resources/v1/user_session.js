const User = require('../../models/user.js')
const logger = require('../../../lib/logger.js')()

exports.delete = async function (req, res) {
  // Flag error if user ID is not provided
  if (!req.params.user_id) {
    res.status(400).send('Please provide user ID.')
    return
  }

  const userId = req.params.user_id

  let user

  try {
    user = await User.findOne({ id: userId })
  } catch (err) {
    logger.error(err)
    res.status(500).send('Error finding user.')
  }

  if (!user) {
    res.status(404).send('User not found.')
    return
  }

  const idx = user.login_tokens.indexOf(req.loginToken)
  if (idx === -1) {
    res.status(401).end()
    return
  }
  user.login_tokens.splice(idx, 1)

  user.save().then(user => {
    res.status(204).end()
  }).catch(err => {
    logger.error(err)
    res.status(500).send('Could not sign-out user.')
  })
} // END function - exports.delete
