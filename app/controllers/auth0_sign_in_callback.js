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
      const user = await auth0.getProfile(body.access_token)
      const apiRequestBody = getUserInfo(user)

      //  Must be an absolute URI
      const endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + '/v1/users'
      axios.post(endpoint, apiRequestBody)
        .then(response => {
          const body = response.data
          res.cookie('user_id', body.id)
          res.cookie('login_token', body.loginToken)
          res.redirect('/just-signed-in')
        })
        .catch(error => {
          logger.error('Error from API when signing in: ' + error)
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
      auth0_id: user.sub,
      email: user.email,
      profile_image_url: user.picture
    }
  }
}

const getUserTwitterAuth0Info = function (user) {
  return {
    auth0_twitter: {
      screenName: user[`${config.auth0.screen_name_custom_claim}`],
      auth0_id: user.sub,
      profile_image_url: user.picture
    }
  }
}

exports.get = function (req, res) {
  if (req.query.error) {
    res.redirect('/error/access-denied')
    return
  }

  const code = req.query.code
  const redirectUri = config.restapi.protocol + config.app_host_port + '/' + config.auth0.callback_path
  const url = config.auth0.token_api_url
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

  axios.post(url, body, options)
    .then(AccessTokenHandler(req, res))
    .catch(err => {
      console.error('Error obtaining access token from Auth0:')
      console.log(err)
      res.redirect('/error/no-access-token')
    })
}
