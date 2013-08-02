var config = require('config'),
    OAuth = require('oauth').OAuth

module.exports = function(options) {
  
  options = options || {}
  
  return new OAuth(
    config.twitter.oauth_request_token_api_uri,
    config.twitter.oauth_access_token_api_uri,
    config.twitter.oauth_consumer_key,
    config.twitter.oauth_consumer_secret,
    config.twitter.oauth_version,
    options.callbackUri || 'http://' + config.app_host_port + config.twitter.oauth_callback_uri,
    config.twitter.oauth_signature_method
  )

} // END function - module.exports

