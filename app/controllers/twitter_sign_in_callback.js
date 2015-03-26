var config = require('config'),
    request = require('request'),
    oauth = require('../../lib/oauth.js')

var oauthAccessTokenHandler = function(req, res) {

  return function(err, oauth_access_token_key, oauth_access_token_secret, results) {
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
        oauthAccessTokenKey: oauth_access_token_key,
        oauthAccessTokenSecret: oauth_access_token_secret
      }
    }
    request.post({ url: config.restapi.baseuri + '/v1/users', json: apiRequestBody }, function(err, response, body) {
      if (err) {
        console.error('Error from API when signing in: ' + err)
        res.redirect('/error/authentication-api-problem')
        return
      }

      // Redirect user
      res.cookie('user_id', body.id)
      res.cookie('login_token', body.loginToken)
      res.redirect(req.session.oauth.redirect_uri)

    })

  }

}

exports.get = function(req, res) {

  if (req.query.denied) {

    res.redirect('/error/twitter-access-denied')
    return

  }

  else if (req.session.oauth) {

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
