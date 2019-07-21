var config = require('config')
var axios = require('axios')
var oauth = require('../../lib/oauth.js')

var oauthAccessTokenHandler = function (req, res) {
  return function (err, oauthAccessTokenKey, oauthAccessTokenSecret, results) {
    if (err) {
      console.error('Error obtaining access token from Twitter:')
      console.log(err)

      res.redirect('/error/no-twitter-access-token')
      return
    }

    // Call REST API to sign-in via Twitter
    var apiRequestBody = {
      twitter: {
        userId: results.user_id,
        screenName: results.screen_name,
        oauthAccessTokenKey: oauthAccessTokenKey,
        oauthAccessTokenSecret: oauthAccessTokenSecret
      }
    }

    // Must be an absolute URI
    var endpoint = config.restapi.protocol + config.app_host_port + config.restapi.baseuri + '/v1/users'

    axios.post(endpoint, apiRequestBody)
      .then(response => {
        const body = response.data
        res.cookie('user_id', body.id)
        res.cookie('login_token', body.loginToken)
        res.redirect(req.session.oauth.redirect_uri)
      })
      .catch(err => {
        console.error('Error from API when signing in: ' + err)
        res.redirect('/error/authentication-api-problem')
      })
  }
}

exports.get = function (req, res) {
  if (req.query.denied) {
    res.redirect('/error/twitter-access-denied')
  } else if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier
    var oa = req.session.oauth

    // Obtain access token from Twitter
    var o = oauth()
    o.getOAuthAccessToken(
      oa.request_token, oa.request_token_secret, oa.verifier,
      oauthAccessTokenHandler(req, res))
  } else {
    res.redirect('/twitter-sign-in')
  }
}
