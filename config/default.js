const port = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

module.exports = {
  env: process.env.NODE_ENV,
  port: port,
  app_host_port: 'localhost:' + port,
  header_host_port: 'localhost:' + port,
  twitter: {
    oauth_request_token_api_uri: 'https://api.twitter.com/oauth/request_token',
    oauth_access_token_api_uri: 'https://api.twitter.com/oauth/access_token',
    oauth_authenticate_uri: 'https://twitter.com/oauth/authenticate',
    oauth_consumer_key: process.env.TWITTER_OAUTH_CONSUMER_KEY,
    oauth_consumer_secret: process.env.TWITTER_OAUTH_CONSUMER_SECRET,
    oauth_version: '1.0A',
    oauth_callback_path: 'twitter-sign-in-callback',
    oauth_signature_method: 'HMAC-SHA1',
    timeout_ms: 500
  },
  auth0: {
    use_auth0: true,
    domain: 'streetmix.auth0.com',
    client_id: process.env.AUTH0_CLIENT_ID || null,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    token_api_url: 'https://streetmix.auth0.com/oauth/token',
    audience: 'https://streetmix.auth0.com/api/v2/',
    screen_name_custom_claim: 'https://twitter.com/screen_name',
    management_scope: 'read:users write:users',
    callback_path: 'sign-in-callback'
  },
  monetization: process.env.WEB_MONETIZATION_PAYMENT_POINTER,
  facebook_app_id: '204327799717656',
  cookie_session_secret: process.env.COOKIE_SESSION_SECRET || 'seger handrail',
  restapi_proxy_baseuri_rel: '/api',
  restapi: {
    port: port,
    protocol: 'http://',
    baseuri: '/api'
  },
  db: {
    sequelize: {
      logging: true,
      database: 'streetmix_dev',
      host: process.env.PGHOST || '127.0.0.1',
      port: process.env.PGPORT || 5432,
      // surely there is a way to inherit these defaults to other config files?
      // heroku hobby tier has max connections of 20, so this is a conservative setting
      // you'll see h22 errors if its too high: https://devcenter.heroku.com/articles/error-codes#h22-connection-limit-reached
      pool: {
        max: 12,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },
  log_level: 'debug',
  no_internet_mode: false,
  l10n: {
    transifex: {
      api_token: process.env.TRANSIFEX_API_TOKEN
    },
    use_local: false
  },
  geocode: {
    pelias: {
      host: 'api.geocode.earth',
      api_key: process.env.PELIAS_API_KEY || null
    }
  },
  geoip: {
    host: 'api.ipstack.com/',
    api_key: process.env.IPSTACK_API_KEY || null,
    protocol: 'http://'
  },
  redis: {
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || '',
    url: process.env.REDIS_URL || null
  },
  cloudinary: {
    api_key: process.env.CLOUDINARY_API_KEY || null,
    api_secret: process.env.CLOUDINARY_API_SECRET || null
  },
  stripe: {
    api_key: process.env.STRIPE_PUBLIC_KEY || null,
    api_secret: process.env.STRIPE_SECRET_KEY || null,
    tier1_plan_id: process.env.TIER1_PLAN_ID || 'plan_Fc2mb0eKhaEzu5'
  }
}
