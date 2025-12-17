import axios from 'axios'

import { userClient } from '../lib/auth0.ts'
import logger from '../lib/logger.js'
import { appURL } from '../lib/url.ts'

const AccessTokenHandler = function (req, res) {
  return async (response) => {
    const body = response.data

    if (body.error && body.error === 'access_denied') {
      res.redirect('/error/access-denied')
      return
    }

    try {
      const refreshToken = body.refresh_token
      const idToken = body.id_token
      const accessToken = body.access_token
      const { data: user } = await userClient.getUserInfo(accessToken)
      const apiRequestBody = getUserInfo(user)
      const endpoint = `${appURL.origin}/api/v1/users`
      const apiRequestOptions = {
        headers: {
          Cookie: `login_token=${idToken};`,
        },
      }

      axios
        .post(endpoint, apiRequestBody, apiRequestOptions)
        .then((response) => {
          const user = response.data
          const userAuthData = apiRequestBody.auth0_twitter
            ? apiRequestBody.auth0_twitter.screenName
            : apiRequestBody.auth0.nickname
          const cookieOptions = {
            maxAge: 9000000000,
            sameSite: 'strict',
          }

          res.cookie('user_id', user.id || userAuthData, cookieOptions)
          res.cookie('refresh_token', refreshToken, cookieOptions)
          res.cookie('login_token', idToken, cookieOptions)
          res.redirect('/services/auth/just-signed-in')
        })
        .catch((error) => {
          logger.error('[auth0] Error from auth0 API when signing in: ' + error)
          res.redirect('/error/authentication-api-problem')
        })
    } catch (error) {
      logger.error('[auth0] Error obtaining user info from Auth0: ' + error)
      res.redirect('/error/no-access-token')
    }
  }
}

const getUserInfo = function (user) {
  // Get the platform the user is authenticating from
  // e.g user.sub = facebook|das3fa
  // get 'facebook' out from the user.sub
  const platform = user.sub.split('|')[0]

  if (platform === 'twitter') {
    return getUserTwitterAuth0Info(user)
  }

  return getUserAuth0Info(user)
}

const getUserAuth0Info = function (user) {
  return {
    auth0: {
      nickname: user.nickname,
      auth0Id: user.sub,
      email: user.email,
      profileImageUrl: user.picture,
    },
  }
}

const getUserTwitterAuth0Info = function (user) {
  return {
    auth0_twitter: {
      screenName: user['https://twitter.com/screen_name'],
      auth0Id: user.sub,
      profileImageUrl: user.picture,
    },
  }
}

export function get(req, res) {
  logger.info('[auth0] Logging in user with data:', req.query)

  if (req.query.error) {
    logger.error('[auth0] Auth0 encountered an error: ' + req.query.error)
    res.redirect('/error/access-denied')
    return
  }

  const tokenUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`
  const body = {
    grant_type: 'authorization_code',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    code: req.query.code,
    redirect_uri: `${appURL.origin}/services/auth/sign-in-callback`,
  }
  const options = {
    headers: { 'content-type': 'application/json' },
    json: true,
  }

  axios
    .post(tokenUrl, body, options)
    .then(AccessTokenHandler(req, res))
    .catch((err) => {
      logger.error('[auth0] Error obtaining access token from Auth0: ' + err)
      res.redirect('/error/no-access-token')
    })
}
