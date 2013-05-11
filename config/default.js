var port = process.env.PORT || 8000

module.exports = {
  port: port,
  app_host_port: 'localhost:' + port,
  twitter: {
    oauth_request_token_api_uri: 'https://api.twitter.com/oauth/request_token',
    oauth_access_token_api_uri: 'https://api.twitter.com/oauth/access_token',
    oauth_authenticate_uri: 'https://twitter.com/oauth/authenticate?oauth_token=%s',
    oauth_consumer_key: process.env.TWITTER_OAUTH_CONSUMER_KEY,
    oauth_consumer_secret: process.env.TWITTER_OAUTH_CONSUMER_SECRET,
    oauth_version: '1.0A',
    oauth_callback_uri: '/twitter-sign-in-callback',
    oauth_signature_method: 'HMAC-SHA1'
  }
}
