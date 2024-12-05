import axios from 'axios'
import { userClient } from '../lib/auth0.js'
import logger from '../lib/logger.js'
import appURL from '../lib/url.js'

// Centralized error handling function
const handleError = (error, res, message, redirectPath) => {
  logger.error(message + ': ' + error.message, {
    errorDetails: error.response ? error.response.data : error.stack
  })
  res.redirect(redirectPath)
}

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

      // Fetch user info using the access token
      const { data: user } = await userClient.getUserInfo(accessToken)
      const apiRequestBody = getUserInfo(user)
      const endpoint = `${appURL.origin}/api/v1/users`
      const apiRequestOptions = {
        headers: {
          Cookie: `login_token=${idToken};`
        }
      }

      // Use async/await for better readability and error handling
      const apiResponse = await axios.post(
        endpoint,
        apiRequestBody,
        apiRequestOptions
      )
      const createdUser = apiResponse.data

      const userAuthData = apiRequestBody.auth0_twitter
        ? apiRequestBody.auth0_twitter.screenName
        : apiRequestBody.auth0.nickname

      const cookieOptions = {
        maxAge: 9000000000,
        sameSite: 'strict'
      }

      // Set cookies and redirect user
      res.cookie('user_id', createdUser.id || userAuthData, cookieOptions)
      res.cookie('refresh_token', refreshToken, cookieOptions)
      res.cookie('login_token', idToken, cookieOptions)
      res.redirect('/services/auth/just-signed-in')
    } catch (error) {
      handleError(
        error,
        res,
        '[auth0] Error obtaining user info or creating user record',
        '/error/authentication-api-problem'
      )
    }
  }
}

const getUserInfo = function (user) {
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
      profileImageUrl: user.picture
    }
  }
}

const getUserTwitterAuth0Info = function (user) {
  return {
    auth0_twitter: {
      screenName: user['https://twitter.com/screen_name'],
      auth0Id: user.sub,
      profileImageUrl: user.picture
    }
  }
}

// Main handler for sign-in process
export async function get (req, res) {
  logger.info('[auth0] Logging in user with data:', req.query)

  if (req.query.error) {
    handleError(
      new Error(req.query.error),
      res,
      '[auth0] Auth0 encountered an error',
      '/error/access-denied'
    )
    return
  }

  const tokenUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`
  const body = {
    grant_type: 'authorization_code',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    code: req.query.code,
    redirect_uri: `${appURL.origin}/services/auth/sign-in-callback`
  }

  const options = {
    headers: { 'content-type': 'application/json' }
  }

  try {
    // Use await to handle the token request
    const tokenResponse = await axios.post(tokenUrl, body, options)
    AccessTokenHandler(req, res)(tokenResponse)
  } catch (error) {
    handleError(
      error,
      res,
      '[auth0] Error obtaining access token from Auth0',
      '/error/no-access-token'
    )
  }
}
