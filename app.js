process.title = 'streetmix'
require('dotenv').config()

// Run this before other modules
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

const compression = require('compression')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const cors = require('cors')
const express = require('express')
const helmet = require('helmet')
const config = require('config')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const controllers = require('./app/controllers')
const requestHandlers = require('./lib/request_handlers')
const initRedisClient = require('./lib/redis')
const initCloudinary = require('./lib/cloudinary')
const compileSVGSprites = require('./lib/svg-sprite')
const exec = require('child_process').exec
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const apiRoutes = require('./app/api_routes')
const serviceRoutes = require('./app/service_routes')
const chalk = require('chalk')
const logger = require('./lib/logger.js')()
const jwtCheck = require('./app/authentication')

const client = initRedisClient()
initCloudinary()
compileSVGSprites('assets/images/icons/', 'icons', 'icon')
compileSVGSprites('assets/images/illustrations', 'illustrations', 'image')
compileSVGSprites(
  'node_modules/@streetmix/illustrations/images/',
  'images',
  'image'
)

const app = (module.exports = express())

// Get the timestamp of this server's start time to use as a cachebusting filename.
const cacheTimestamp = Date.now()
app.locals.cacheTimestamp = cacheTimestamp

process.on('uncaughtException', function (error) {
  logger.error(chalk`[process] {bold Uncaught exception:} ${error}`)

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
    logger.info(chalk`[express] {yellow.bold Stopping Streetmix!}`)
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
      'checkout.stripe.com',
      (req, res) => "'nonce-" + res.locals.nonce.google_analytics + "'",
      (req, res) => "'nonce-" + res.locals.nonce.mixpanel + "'"
    ],
    workerSrc: ["'self'"],
    childSrc: ['platform.twitter.com'],
    frameSrc: ["'self'", 'streetmix.github.io', 'checkout.stripe.com'],
    imgSrc: [
      "'self'",
      'data:',
      'pbs.twimg.com',
      'syndication.twitter.com',
      's.gravatar.com',
      'https://www.google-analytics.com',
      '*.basemaps.cartocdn.com',
      'https://res.cloudinary.com/',
      '*.stripe.com'
    ],
    fontSrc: ["'self'", 'fonts.gstatic.com', '*.typekit.net'],
    connectSrc: [
      "'self'",
      'api.mixpanel.com',
      'api.geocode.earth',
      'syndication.twitter.com',
      'https://www.google-analytics.com',
      'sentry.io',
      'streetmix.auth0.com',
      'checkout.stripe.com'
    ]
  }
}

// Allows websockets for hot-module reloading (note: ports are assigned randomly by Parcel)
if (app.locals.config.env === 'development') {
  csp.directives.scriptSrc.push("'unsafe-eval'")
  csp.directives.connectSrc.push('ws:')
}

app.use(helmet(helmetConfig))
app.use(express.json())
app.use(compression())
app.use(cookieParser())
app.use(
  cookieSession({ secret: config.cookie_session_secret, sameSite: 'strict' })
)

app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

// Set variables for use in view templates
app.use((req, res, next) => {
  // Generate nonces for inline scripts
  res.locals.nonce = {
    google_analytics: uuidv4(),
    mixpanel: uuidv4()
  }

  // Set default metatag information for social sharing cards
  res.locals.STREETMIX_IMAGE = {
    image: 'https://streetmix.net/images/thumbnail.png',
    width: 1008,
    height: 522
  }

  res.locals.STREETMIX_TITLE = 'Streetmix'
  res.locals.STREETMIX_URL =
    config.restapi.protocol + config.app_host_port + '/'

  // Make required Facebook app ID available to metatags
  res.locals.FACEBOOK_APP_ID = config.facebook_app_id
  res.locals.STRIPE_PUBLIC_KEY = config.STRIPE_PUBLIC_KEY

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

app.get('/help/about', (req, res) =>
  res.redirect('https://www.opencollective.com/streetmix/')
)
app.get('/map', (req, res) => res.redirect('https://streetmix.github.io/map/'))
app.get('/survey', jwtCheck, controllers.survey.get)
app.post('/services/auth/refresh-login-token', cors(), controllers.refresh.post)

app.get('/privacy-policy', (req, res) => res.render('privacy'))
app.get('/terms-of-service', (req, res) => res.render('tos'))

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(
  '/' + config.twitter.oauth_callback_path,
  controllers.twitter_sign_in_callback.get
)
// Auth0
app.get(
  '/' + config.auth0.callback_path,
  controllers.auth0_sign_in_callback.get
)

// API routes
app.use('', apiRoutes)
app.use('', serviceRoutes)

app.use(
  '/assets',
  express.static(path.join(__dirname, '/build'), { fallthrough: false })
)
app.use(express.static(path.join(__dirname, '/public')))

// Allow hot-module reloading (HMR)
// and attach API docs
// in non-production environments
if (config.env !== 'production') {
  const runBundle = require('./app/bundle')
  runBundle(app)

  const options = {
    definition: {
      info: {
        title: 'Streetmix', // Title (required)
        version: '0.1.0' // Version (required)
      }
    },
    apis: ['./app/api_routes.js', './app/service_routes.js']
  }
  const displayOptions = {
    customCss: '.swagger-ui .topbar { display: none }'
  }
  const swaggerSpec = swaggerJSDoc(options)
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, displayOptions)
  )
}

app.get(
  ['/:user_id/:namespacedId', '/:user_id/:namespacedId/:street_name'],
  requestHandlers.metatags
)

// Catch-all
app.use((req, res) => res.render('main'))
