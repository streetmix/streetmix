const axios = require('axios')
const logger = require('../../lib/logger.js')()
const config = require('config')

// Refreshes auth0 token so user doesn't need to sign in every 30 days
exports.post = function (req, res) {
  if (!req.body || !req.body.token) {
    res.status(401).send({ error: 'Refresh token is required.' })
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
        logger.error('Missing results from token fresh: ')
        res.status(401).statusend({ error: 'Unable to refresh token.' })
        return
      }
      res.status(200).send({ token: response.data.id_token })
    })
    .catch((error) => {
      logger.error('Error from auth0 refreshing tokens: ' + error)
      res.status(401).statusend({ error: 'Unable to refresh token.' })
    })
}
