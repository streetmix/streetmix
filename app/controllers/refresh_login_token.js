import axios from 'axios'
import { logger } from '../lib/logger.ts'

// Refreshes auth0 token so user doesn't need to sign in every 30 days
export function post(req, res) {
  if (!req.body || !req.body.token) {
    res.status(401).json({ status: 401, msg: 'Refresh token is required.' })
    return
  }

  const endpoint = `https://${process.env.AUTH0_DOMAIN}/oauth/token`
  const apiRequestBody = {
    grant_type: 'refresh_token',
    refresh_token: req.body.token,
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
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
