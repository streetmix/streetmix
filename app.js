process.title = 'streetmix'
require('dotenv').config()

// Run this before other modules
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

const compression = require('compression')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const config = require('config')
const path = require('path')
const uuid = require('uuid/v4')
const controllers = require('./app/controllers')
const resources = require('./app/resources')
const requestHandlers = require('./lib/request_handlers')
const initRedisClient = require('./lib/redis')
const initMongoDB = require('./lib/db')
const initCloudinary = require('./lib/cloudinary')
const exec = require('child_process').exec

const client = initRedisClient()
initMongoDB()
initCloudinary()

const app = module.exports = express()

// Get the timestamp of this server's start time to use as a cachebusting filename.
const cacheTimestamp = Date.now()
app.locals.cacheTimestamp = cacheTimestamp

process.on('uncaughtException', function (error) {
  console.log(error)
  console.trace()

  if (client.connected) {
    client.on('end', function () {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
})

// Provide a message after a Ctrl-C
// Note: various sources tell us that this does not work on Windows
process.on('SIGINT', function () {
  if (app.locals.config.env === 'development') {
    console.log('Stopping Streetmix!')
    exec('npm stop')
  }

  if (client.connected) {
    client.on('end', process.exit)
  } else {
    process.exit()
  }
})

app.locals.config = config

// Not all headers from `helmet` are on by default. These turns on specific
// off-by-default headers for better security as recommended by https://securityheaders.io/
const helmetConfig = {
  frameguard: false, // Allow Streetmix to be iframed in 3rd party sites
  hsts: {
    maxAge: 5184000, // 60 days
    includeSubDomains: false // we don't have a wildcard ssl cert
  },
  referrerPolicy: {
    policy: 'no-referrer-when-downgrade'
  }
}

// CSP directives are defined separately so we can generate nonces
const csp = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'fonts.googleapis.com',
      '*.typekit.net',
      'https://d10lpsik1i8c69.cloudfront.net', // Lucky Orange
      'checkout.stripe.com'
    ],
    scriptSrc: [
      "'self'",
      'platform.twitter.com',
      'https://www.google-analytics.com',
      'cdn.mxpnl.com',
      'streetmix.auth0.com',
      '*.basemaps.cartocdn.com',
      'api.geocode.earth',
      'downloads.mailchimp.com.s3.amazonaws.com',
      'https://d10lpsik1i8c69.cloudfront.net', // Lucky Orange
      'checkout.stripe.com',
      (req, res) => "'nonce-" + res.locals.nonce.google_analytics + "'",
      (req, res) => "'nonce-" + res.locals.nonce.mixpanel + "'",
      (req, res) => "'nonce-" + res.locals.nonce.luckyorange + "'"
    ],
    workerSrc: [
      'blob:' // Lucky Orange
    ],
    childSrc: ['platform.twitter.com'],
    frameSrc: [
      "'self'",
      'streetmix.github.io',
      'checkout.stripe.com'
    ],
    imgSrc: [
      "'self'",
      'data:',
      'pbs.twimg.com',
      'syndication.twitter.com',
      's.gravatar.com',
      'https://www.google-analytics.com',
      '*.basemaps.cartocdn.com',
      'https://res.cloudinary.com/',
      'https://d10lpsik1i8c69.cloudfront.net', // Lucky Orange
      '*.stripe.com'
    ],
    mediaSrc: [
      'https://d10lpsik1i8c69.cloudfront.net' // Lucky Orange
    ],
    fontSrc: [
      "'self'",
      'fonts.gstatic.com',
      '*.typekit.net'
    ],
    connectSrc: [
      "'self'",
      'api.mixpanel.com',
      'api.geocode.earth',
      'syndication.twitter.com',
      'https://www.google-analytics.com',
      'app.getsentry.com',
      'streetmix.auth0.com',
      'https://settings.luckyorange.net', // Lucky Orange
      'wss://*.visitors.live', // Lucky Orange
      'wss://visitors.live', // Lucky Orange
      'https://pubsub.googleapis.com', // Lucky Orange
      'checkout.stripe.com'
    ]
  }
}

// Allow arbitrary injected code (e.g. Redux dispatches from dev tools) in development
if (app.locals.config.env === 'development') {
  csp.directives.scriptSrc.push("'unsafe-eval'")
  // Allows websockets for hot-module reloading (note: ports are assigned randomly by Parcel)
  csp.directives.connectSrc.push('ws:')
}

app.use(helmet(helmetConfig))
app.use(express.json())
app.use(compression())
app.use(cookieParser())
app.use(cookieSession({ secret: config.cookie_session_secret }))

app.use(requestHandlers.login_token_parser)
app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

// Set variables for use in view templates
app.use((req, res, next) => {
  // Generate nonces for inline scripts
  res.locals.nonce = {
    google_analytics: uuid(),
    mixpanel: uuid(),
    luckyorange: uuid()
  }

  // Set default metatag information for social sharing cards
  res.locals.STREETMIX_IMAGE = {
    image: 'https://streetmix.net/images/thumbnail.png',
    width: 1008,
    height: 522
  }

  res.locals.STREETMIX_TITLE = 'Streetmix'
  res.locals.STREETMIX_URL = config.restapi.protocol + config.app_host_port + '/'

  // Make required Facebook app ID available to metatags
  res.locals.FACEBOOK_APP_ID = config.facebook_app_id

  next()
})

// Set Redis client for when requesting the geoip
app.use('/services/geoip', (req, res, next) => {
  req.redisClient = client
  next()
})

// Set CSP directives
app.use(helmet.contentSecurityPolicy(csp))

// Rewrite requests with timestamp
app.use((req, res, next) => {
  // Matches a filename like styles.2395934243.css
  // Accepts optional `?29090424` query string used by Parcel's hot-module reloader
  req.url = req.url.replace(/\/([^/]+)\.[0-9]+\.(css|js)(\?[0-9]+)?$/, '/$1.$2')
  next()
})

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, '/app/views'))

app.get('/help/about', (req, res) => res.redirect('https://www.opencollective.com/streetmix/'))
app.get('/map', (req, res) => res.redirect('https://streetmix.github.io/map/'))

app.get('/privacy-policy', (req, res) => res.render('privacy'))
app.get('/terms-of-service', (req, res) => res.render('tos'))

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get('/' + config.twitter.oauth_callback_path, controllers.twitter_sign_in_callback.get)
// Auth0
app.get('/' + config.auth0.callback_path, controllers.auth0_sign_in_callback.get)

// Enable CORS for all OPTIONs "pre-flight" requests
app.options('/api/*', cors())

// Payments handler
app.post('/pay', controllers.payments.post)

// API: all users
app.post('/api/v1/users', cors(), resources.v1.users.post)
app.get('/api/v1/users', cors(), resources.v1.users.get)

// API: single user
app.get('/api/v1/users/:user_id', cors(), resources.v1.user.get)
app.put('/api/v1/users/:user_id', cors(), resources.v1.user.put)
app.delete('/api/v1/users/:user_id', cors(), resources.v1.user.delete)

// API: single user sign-in state
app.delete('/api/v1/users/:user_id/login-token', cors(), resources.v1.user_session.delete)

// API: single user streets
app.delete('/api/v1/users/:user_id/streets', cors(), resources.v1.users_streets.delete)
app.get('/api/v1/users/:user_id/streets', cors(), resources.v1.users_streets.get)

// API: all streets
app.post('/api/v1/streets', resources.v1.streets.post)
app.get('/api/v1/streets', resources.v1.streets.find)
app.head('/api/v1/streets', resources.v1.streets.find)

// API: single street
app.delete('/api/v1/streets/:street_id', resources.v1.streets.delete)
app.head('/api/v1/streets/:street_id', resources.v1.streets.get)
app.get('/api/v1/streets/:street_id', resources.v1.streets.get)
app.put('/api/v1/streets/:street_id', resources.v1.streets.put)

// Merge with users handler
// app.post('/api/v1/users', cors(), resources.v1.users_pg.post)

// Merge with user handler
// app.get('/api/v1/users/:user_id', cors(), resources.v1.users_pg.get)
// app.put('/api/v1/users/:user_id', cors(), resources.v1.users_pg.put)

// Merge with user_session handler
// app.delete('/api/v1/users/:user_id/login-token', cors(), resources.v1.users_pg.delete)

// app.get('/api/v1/users/:user_id/streets', cors(), resources.v1.users_streets_pg.get)

// app.post('/api/v1/streets', resources.v1.streets_pg.post)
// app.get('/api/v1/streets', resources.v1.streets_pg.find)
// app.head('/api/v1/streets', resources.v1.streets_pg.find)

// app.delete('/api/v1/streets/:street_id', resources.v1.streets_pg.delete)
// app.head('/api/v1/streets/:street_id', resources.v1.streets_pg.get)
// app.get('/api/v1/streets/:street_id', resources.v1.streets_pg.get)
// app.put('/api/v1/streets/:street_id', resources.v1.streets_pg.put)

app.post('/api/v1/streets/images/:street_id', bodyParser.text({ limit: '3mb' }), resources.v1.street_images.post)
app.delete('/api/v1/streets/images/:street_id', resources.v1.street_images.delete)
app.get('/api/v1/streets/images/:street_id', resources.v1.street_images.get)

app.get('/api/v1/geo', cors(), resources.v1.geo.get)

app.get('/services/geoip', resources.services.geoip.get)

app.options('/services/images', cors())
app.get('/services/images', cors(), resources.services.images.get)

app.get('/api/v1/translate/:locale_code/:resource_name', resources.v1.translate.get)

app.get('/api/v1/flags', cors(), resources.v1.flags.get)

// Catch all for all broken api paths, direct to 404 response.
app.get('/api/*', (req, res) => {
  res.status(404).json({ status: 404, error: 'Not found. Did you mispell something?' })
})

// SVG bundled images served directly from packages
app.get('/assets/images/icons.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/@streetmix/icons/dist/icons.svg'))
})

app.get('/assets/images/images.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '/node_modules/@streetmix/illustrations/dist/images.svg'))
})

app.use('/assets', express.static(path.join(__dirname, '/build'), { fallthrough: false }))
app.use(express.static(path.join(__dirname, '/public')))

// Allow hot-module reloading (HMR) in non-production environments
if (config.env !== 'production') {
  const runBundle = require('./app/bundle')
  runBundle(app)
}

app.get(['/:user_id/:namespaced_id', '/:user_id/:namespaced_id/:street_name'], requestHandlers.metatags)

// Catch-all
app.use((req, res) => res.render('main'))
