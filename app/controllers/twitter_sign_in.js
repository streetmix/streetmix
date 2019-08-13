var config = require('config')
var oauth = require('../../lib/oauth.js')
var logger = require('../../lib/logger.js')()

var oauthRequestTokenHandler = function (req, res) {
  return function (err, oauthToken, oauthTokenSecret, results) {
    if (err) {
      console.error('Error obtaining request token from Twitter:')
      console.error(err)

      res.redirect('/error/no-twitter-request-token')
      return
    }

    req.session.oauth = {}
    req.session.oauth.request_token = oauthToken
    req.session.oauth.request_token_secret = oauthTokenSecret
    req.session.oauth.redirect_uri = req.query.redirectUri || '/'

    // Redirect user to Twitter sign-in flow
    res.redirect(config.twitter.oauth_authenticate_uri + '?oauth_token=' + oauthToken)
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
