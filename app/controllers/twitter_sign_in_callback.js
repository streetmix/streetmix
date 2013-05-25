var config = require('config'),
    request = require('request'),
    oauth = require('../../lib/oauth.js')

var oauthAccessTokenHandler = function(req, res) {

  return function(err, oauth_access_token, oauth_token_secret, results) {
    if (err) {
      console.error('Error obtaining access token from Twitter:')
      console.log(err)
      
      res.redirect('/twitter-sign-in')
      return
    }
    
    // Call REST API to sign-in via Twitter
    var apiRequestBody = {
      twitter: {
        user_id: results.user_id,
        screen_name: results.screen_name,
        oauth_token: oauth_access_token,
        oauth_token_secret: oauth_token_secret
      }
    }
    request.post({ url: config.restapi_baseuri + '/v1/users', json: apiRequestBody }, function(err, response, body) {
      if (err) {
        console.error('Error from API when signing in: ' + err)
        res.redirect('/?msg=Could not sign-in')
        return
      }

      // Redirect user back to main page
      res.cookie('login_token', body.loginToken)
      res.redirect('/')
      
    })
    
  }
  
}

exports.get = function(req, res) {
  
  if (req.session.oauth) {

    req.session.oauth.verifier = req.query.oauth_verifier
    var oa = req.session.oauth

    // Obtain access token from Twitter
    oauth.getOAuthAccessToken(
      oa.request_token, oa.request_token_secret, oa.verifier,
      oauthAccessTokenHandler(req, res))
    
  } else {
    
    res.redirect('/twitter-sign-in')
    
  }

}
