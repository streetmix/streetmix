const logger = require('../../../lib/logger.js')()

exports.delete = async function (req, res) {
  if (!req.user) {
    res.status(400).json({ status: 400, msg: 'Must have user to logout.' })
    return
  }

  try {
    res.cookie('refresh_token', '')
    res.cookie('login_token', '')
    res.cookie('access_token', '')
    res.status(204).end()
  } catch (err) {
    logger.error(err)
    res.status(500).json({ status: 500, msg: 'Error logging out user.' })
  }
}
