const config = require('config')
const request = require('request')
const logger = require('../../lib/logger.js')()
const { Authentication } = require('../../lib/auth0')

var AccessTokenHandler = function (req, res) {
  return function (err, response, body) {
    if (err) {
      console.error('Error obtaining access token from Twitter:')
      console.log(err)
      res.redirect('/error/no-twitter-access-token')
      return
    }
    if (body.error && body.error === 'access_denied') {
      console.error(body)
      res.redirect('/error/no-twitter-access-token')
      return
    }
    let auth0 = Authentication()
    function handleUserInfo (err, user) {
      if (err) {
        console.error('Error obtaining access token from Twitter:')
        console.log(err)
        // TODO: Redirect to error page indicating invalid access token
        res.redirect('/error/no-twitter-access-token')
        return
      }
      var apiRequestBody = {
        auth0_twitter: {
          screenName: user[`${config.auth0.screen_name_custom_claim}`],
          refresh_token: body.refresh_token,
          auth0_id: user.sub
        }
      }
      // Must be an absolute URI
      let endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + '/v1/users'
      request.post({ url: endpoint, json: apiRequestBody }, function (err, response, body) {
        if (err) {
          logger.error('Error from API when signing in: ' + err)
          res.redirect('/error/authentication-api-problem')
          return
        }
        console.log(body)
        // Redirect user
        res.cookie('user_id', body.id)
        res.cookie('login_token', body.loginToken)
        res.redirect('/')
      })
    }
    console.log(body)
    auth0.getProfile(body.access_token, handleUserInfo)
  }
}

exports.get = function (req, res) {
  if (req.query.error === 'access_denied') {
    res.redirect('/error/twitter-access-denied')
  }

  let code = req.query.code
  // TODO: Update twitter callback uri from oauth
  let redirectUri = config.restapi.protocol + config.app_host_port + config.twitter.oauth_callback_uri
  let options = {
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
  console.log(options)
  request(options, AccessTokenHandler(req, res))
}
