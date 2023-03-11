import logger from '../../lib/logger.js'

export async function del (req, res) {
  // In order to sign out, make sure the user's session cookies
  // are part of the request.
  if (!req.auth) {
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
