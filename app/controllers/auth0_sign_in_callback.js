const config = require('config')
const axios = require('axios')
const logger = require('../../lib/logger.js')()
const { Authentication } = require('../../lib/auth0')

const AccessTokenHandler = function (req, res) {
  return async (response) => {
    const body = response.data
    if (body.error && body.error === 'access_denied') {
      res.redirect('/error/access-denied')
      return
    }
    const auth0 = Authentication()

    try {
      const refreshToken = body.refresh_token
      const idToken = body.id_token
      const accessToken = body.access_token
      const user = await auth0.getProfile(accessToken)

      const apiRequestBody = getUserInfo(user)
      const endpoint = `${config.restapi.protocol}${req.headers.host}/api/v1/users`
      const apiRequestOptions = {
        headers: {
          login_token: idToken
        }
      }

      axios
        .post(endpoint, apiRequestBody, apiRequestOptions)
        .then((response) => {
          const user = response.data
          const userAuthData = apiRequestBody.auth0_twitter
            ? apiRequestBody.auth0_twitter.screenName
            : apiRequestBody.auth0.nickname

          const cookieOptions = { maxAge: 9000000000 }
          res.cookie('user_id', user.id || userAuthData, cookieOptions)
          res.cookie('refresh_token', refreshToken, cookieOptions)
          res.cookie('login_token', idToken, cookieOptions)
          res.cookie('access_token', accessToken, cookieOptions)
          res.redirect('/just-signed-in')
        })
        .catch((error) => {
          logger.error('Error from auth0 API when signing in: ' + error)
          res.redirect('/error/authentication-api-problem')
        })
    } catch (error) {
      logger.error('Error obtaining user info from Auth0: ' + error)
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
      profileImageUrl: user.picture
    }
  }
}

const getUserTwitterAuth0Info = function (user) {
  return {
    auth0_twitter: {
      screenName: user[`${config.auth0.screen_name_custom_claim}`],
      auth0Id: user.sub,
      profileImageUrl: user.picture
    }
  }
}

exports.get = function (req, res) {
  if (req.query.error) {
    logger.error('Auth0 encountered an error: ' + req.query.error)
    res.redirect('/error/access-denied')
    return
  }

  const code = req.query.code

  const redirectUri = `${config.restapi.protocol}${req.headers.host}/${config.auth0.callback_path}`

  const tokenUrl = config.auth0.token_api_url
  const options = {
    headers: { 'content-type': 'application/json' },
    json: true
  }

  const body = {
    grant_type: 'authorization_code',
    client_id: config.auth0.client_id,
    client_secret: config.auth0.client_secret,
    code: code,
    redirect_uri: redirectUri
  }

  axios
    .post(tokenUrl, body, options)
    .then(AccessTokenHandler(req, res))
    .catch((err) => {
      logger.error('Error obtaining access token from Auth0: ' + err)
      res.redirect('/error/no-access-token')
    })
}
