var config = require('config')
var sprintf = require('sprintf').sprintf
var oauth = require('../../lib/oauth.js')
var logger = require('../../lib/logger.js')()

var oauthRequestTokenHandler = function (req, res) {
  return function (err, oauth_token, oauth_token_secret, results) {
    if (err) {
      console.error('Error obtaining request token from Twitter:')
      console.error(err)

      res.redirect('/error/no-twitter-request-token')
      return
    }

    req.session.oauth = {}
    req.session.oauth.request_token = oauth_token
    req.session.oauth.request_token_secret = oauth_token_secret
    req.session.oauth.redirect_uri = req.query.redirectUri || '/'

    // Redirect user to Twitter sign-in flow
    res.redirect(sprintf(config.twitter.oauth_authenticate_uri, oauth_token))
    return
  }
}

exports.get = function (req, res) {
  // Obtain request token from Twitter
  var o = oauth({
    callbackUri: req.query.callbackUri
  })
  logger.error(o)
  o.getOAuthRequestToken(oauthRequestTokenHandler(req, res))
} // END function - exports.get
