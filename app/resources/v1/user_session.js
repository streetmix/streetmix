const logger = require('../../../lib/logger.js')()

exports.delete = async function (req, res) {
  if (!req.user) {
    res.status(400).json({ status: 400, msg: 'Must have user to logout.' })
    return
  }

  try {
    const cookieOptions = { maxAge: 0, sameSite: 'Strict' }
    res.cookie('refresh_token', '', cookieOptions)
    res.cookie('login_token', '', cookieOptions)
    res.cookie('access_token', '', cookieOptions)
    res.status(204).end()
  } catch (err) {
    logger.error(err)
    res.status(500).json({ status: 500, msg: 'Error logging out user.' })
  }
}
