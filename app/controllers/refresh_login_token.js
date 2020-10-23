const axios = require('axios')
const logger = require('../../lib/logger.js')()
const config = require('config')

// Refreshes auth0 token so user doesn't need to sign in every 30 days
exports.post = function (req, res) {
  if (!req.body || !req.body.token) {
    res.status(401).json({ status: 401, msg: 'Refresh token is required.' })
    return
  }

  const endpoint = config.auth0.token_api_url
  const apiRequestBody = {
    grant_type: 'refresh_token',
    refresh_token: req.body.token,
    client_id: config.auth0.client_id,
    client_secret: config.auth0.client_secret
  }

  axios
    .post(endpoint, apiRequestBody, {})
    .then((response) => {
      if (!response.data.id_token) {
        logger.error('Missing results from token refresh: ')
        res.status(401).json({ status: 401, msg: 'Unable to refresh token.' })
        return
      }

      const cookieOptions = { maxAge: 9000000000, sameSite: 'strict' }
      res.cookie('login_token', response.data.id_token, cookieOptions)
      res.status(200).json({ token: response.data.id_token })
    })
    .catch((error) => {
      logger.error('Error from auth0 refreshing tokens: ' + error)
      res.status(401).json({ status: 401, msg: 'Unable to refresh token.' })
    })
}
