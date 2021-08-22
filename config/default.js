const port = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  env: process.env.NODE_ENV,
  port: port,
  app_host_port: process.env.APP_DOMAIN || 'localhost:' + port,
  auth0: {
    domain: process.env.AUTH0_DOMAIN || null,
    client_id: process.env.AUTH0_CLIENT_ID || null,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    token_api_url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
    screen_name_custom_claim: 'https://twitter.com/screen_name',
    management_scope: 'read:users write:users',
    callback_path: '/services/auth/sign-in-callback'
  },
  restapi_proxy_baseuri_rel: '/api',
  restapi: {
    port: port,
    protocol: 'http://',
    baseuri: '/api'
  }
}
