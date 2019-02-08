const config = require('config')
const path = require('path')
const Bundler = require('parcel-bundler')

// Add config variables to process.env which get injected into JS bundle
process.env.APP_HOST_PORT = config.get('app_host_port')
process.env.FACEBOOK_APP_ID = config.get('facebook_app_id')
process.env.API_URL = config.get('restapi_proxy_baseuri_rel')
process.env.PELIAS_HOST_NAME = config.get('geocode.pelias.host')
process.env.PELIAS_API_KEY = config.get('geocode.pelias.api_key')
process.env.TWITTER_CALLBACK_PATH = config.get('twitter.oauth_callback_path')
process.env.AUTH0_CALLBACK_PATH = config.get('auth0.callback_path')
process.env.AUTH0_DOMAIN = config.get('auth0.domain')
process.env.AUTH0_CLIENT_ID = config.get('auth0.client_id')
process.env.STRIPE_API_KEY = config.get('stripe.api_key')
process.env.USE_AUTH0 = config.get('auth0.use_auth0')
process.env.ENV = config.get('env')
process.env.NO_INTERNET_MODE = config.get('no_internet_mode')

async function runBundle (app) {
  const bundler = new Bundler(path.join(process.cwd(), '/assets/scripts/main.js'), {
    outDir: './build',
    publicUrl: '/assets'
    // scopeHoist: true // Turns on experimental tree-shaking (broken)
  })

  if (config.env === 'production') {
    await bundler.bundle()
  } else {
    if (app) {
      // Also runs .bundle()
      app.use(bundler.middleware())
    } else {
      await bundler.serve()
    }
  }
}

// In production bundle immediately and exit.
if (config.env === 'production') {
  runBundle()
}

module.exports = runBundle
