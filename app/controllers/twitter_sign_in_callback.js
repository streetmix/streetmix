var config = require('config'),
    oauth = require('../../lib/oauth.js')

var oauthAccessTokenHandler = function(req, res) {

  return function(err, oauth_token, oauth_token_secret, results) {
    if (err) {
      console.error('Error obtaining access token from Twitter:')
      console.log(err)
      
      res.redirect('/twitter-sign-in')
      return
    }
    
    req.session.oauth.access_token = oauth_token
    req.session.oauth.access_token_secret = oauth_token_secret
    console.log(results)
    console.log(req.session)
    console.log(req.cookies)
    
    // TODO: Call new user API
    
    // Redirect user back to main page
    res.redirect('/?msg=Signed in!')
    return
    
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
