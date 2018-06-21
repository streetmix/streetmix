const config = require('config')
const request = require('request')
const logger = require('../../lib/logger.js')()
const { Authentication } = require('../../lib/auth0')

const AccessTokenHandler = function (req, res) {
  return function (err, response, body) {
    if (err) {
      console.error('Error obtaining access token from Auth0:')
      console.log(err)
      res.redirect('/error/no-email-access-token')
      return
    }

    if (body.error && body.error === 'access_denied') {
      res.redirect('/error/email-access-denied')
      return
    }

    const auth0 = Authentication()

    function handleUserInfo (err, user) {
      if (err) {
        console.error('Error obtaining user info from Auth0:')
        console.log(err)
        res.redirect('/error/no-email-access-token')
        return
      }

      const apiRequestBody = {
        auth0_email: {
          nickname: user.nickname,
          auth0_id: user.sub,
          email: user.email,
          profile_image_url: user.picture
        }
      }
      //  Must be an absolute URI
      const endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + '/v1/users'
      request.post({ url: endpoint, json: apiRequestBody }, function (err, response, body) {
        if (err) {
          logger.error('Error from API when signing in: ' + err)
          res.redirect('/error/authentication-api-problem')
          return
        }
        // Redirect user
        res.cookie('user_id', body.id)
        res.cookie('login_token', body.loginToken)
        res.redirect('/just-signed-in')
      })
    }
    auth0.getProfile(body.access_token, handleUserInfo)
  }
}

exports.get = function (req, res) {
  const code = req.query.code
  const redirectUri = config.restapi.protocol + config.app_host_port + config.auth0.email_callback_uri
  const options = {
    method: 'POST',
    url: config.auth0.token_api_url,
    headers: { 'content-type': 'application/json' },
    body: {
      grant_type: 'authorization_code',
      client_id: config.auth0.client_id,
      client_secret: config.auth0.client_secret,
      code: code,
      redirect_uri: redirectUri
    },
    json: true
  }
  request(options, AccessTokenHandler(req, res))
}
