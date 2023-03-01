process.title = 'streetmix'
const path = require('path')

// Run this before other modules
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

// Set some defaults for env vars, if not set
// This must be set after `dotenv` loads
process.env.APP_DOMAIN = process.env.APP_DOMAIN || 'localhost'
process.env.APP_PROTOCOL =
  process.env.PROTOCOL || process.env.APP_DOMAIN === 'localhost'
    ? 'http'
    : 'https'
process.env.PORT = process.env.PORT || 8000
process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const compression = require('compression')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const express = require('express')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const swaggerJSDoc = require('swagger-jsdoc')
const chalk = require('chalk')
const passport = require('passport')
const controllers = require('./app/controllers')
const requestHandlers = require('./app/lib/request_handlers')
const initCloudinary = require('./app/lib/cloudinary')
const compileSVGSprites = require('./app/lib/svg-sprite')
const appURL = require('./app/lib/url')
const apiRoutes = require('./app/api_routes')
const serviceRoutes = require('./app/service_routes')
const logger = require('./app/lib/logger.js')
const jwtCheck = require('./app/authentication')

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
  process.exit(1)
})

// Provide a message after a Ctrl-C
// Note: various sources tell us that this does not work on Windows
process.on('SIGINT', function () {
  if (process.env.NODE_ENV === 'development') {
    logger.info(chalk`[express] {yellow.bold Stopping Streetmix!}`)
  }
  process.exit()
})

// Pass environment variables to handlebars templates
app.locals.env = {
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  WEB_MONETIZATION_PAYMENT_POINTER: process.env.WEB_MONETIZATION_PAYMENT_POINTER
}

// Not all headers from `helmet` are on by default. These turns on specific
// off-by-default headers for better security as recommended by https://securityheaders.io/
const helmetConfig = {
  frameguard: false, // Allow Streetmix to be iframed in 3rd party sites
  contentSecurityPolicy: false, // These are set explicitly later
  crossOriginEmbedderPolicy: false, // Load external assets
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
      'checkout.stripe.com'
    ],
    scriptSrc: [
      "'self'",
      'platform.twitter.com',
      'cdn.mxpnl.com',
      process.env.AUTH0_DOMAIN,
      '*.basemaps.cartocdn.com',
      process.env.PELIAS_HOST_NAME,
      'downloads.mailchimp.com.s3.amazonaws.com',
      'checkout.stripe.com',
      'plausible.io',
      'cdn.coil.com'
    ],
    workerSrc: ["'self'"],
    childSrc: ['platform.twitter.com'],
    frameSrc: ["'self'", 'streetmix.github.io', 'checkout.stripe.com'],
    imgSrc: [
      "'self'",
      'data:',
      // Profile images
      'pbs.twimg.com',
      'syndication.twitter.com',
      's.gravatar.com',
      // Auth0 default profile images
      'https://i0.wp.com/cdn.auth0.com/',
      '*.basemaps.cartocdn.com',
      'https://res.cloudinary.com/',
      '*.stripe.com'
    ],
    fontSrc: ["'self'", 'fonts.gstatic.com'],
    connectSrc: [
      "'self'",
      process.env.PELIAS_HOST_NAME,
      'syndication.twitter.com',
      'sentry.io',
      process.env.AUTH0_DOMAIN,
      'checkout.stripe.com',
      'plausible.io',
      'buttondown.email'
    ],
    reportUri: '/services/csp-report/'
  },
  // Report (but do not block) CSP violations in development mode.
  // This allows developers to work on new or experimental features without
  // worrying about modifying CSP headers.
  // !! WARNING !!
  // Reported CSP violations should be addressed before releasing to
  // production. IF A NEW FEATURE IS REPORTING A CSP VIOLATION, IT WILL
  // FAIL IN PRODUCTION, EVEN THOUGH IT WORKS IN DEVELOPMENT MODE.
  reportOnly: process.env.NODE_ENV === 'development'
}

// Allows websockets for hot-module reloading
// (note: ports are assigned randomly by Parcel)
if (process.env.NODE_ENV === 'development') {
  csp.directives.scriptSrc.push("'unsafe-eval'")
  csp.directives.connectSrc.push('ws:')
}

app.use(helmet(helmetConfig))
app.use(express.json())
app.use(compression())
app.use(cookieParser())
app.use(
  cookieSession({
    secret: process.env.COOKIE_SESSION_SECRET || 'seger handrail',
    sameSite: 'strict'
  })
)

app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

app.use(passport.initialize())
app.use(passport.session())

// Set variables for use in view templates
app.use((req, res, next) => {
  // Generate nonces for inline scripts
  res.locals.nonce = {
    // Currently: we use none
  }

  // Set default metatag information for social sharing cards
  res.locals.STREETMIX_IMAGE = {
    image: 'https://streetmix.net/images/thumbnail.png',
    width: 1008,
    height: 522
  }

  res.locals.STREETMIX_TITLE = 'Streetmix'
  res.locals.STREETMIX_URL = appURL.href

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
app.get('/privacy-policy', (req, res) =>
  res.redirect('https://about.streetmix.net/privacy-policy/')
)
app.get('/terms-of-service', (req, res) =>
  res.redirect('https://about.streetmix.net/terms-of-use/')
)

// API routes
app.use('', apiRoutes)
app.use('', serviceRoutes)

app.use('/assets', express.static(path.join(__dirname, '/build')))
app.use(express.static(path.join(__dirname, '/public')))

// Catch-all for broken asset paths.
app.all('/images/*', (req, res) => {
  res.status(404).render('404')
})
app.all('/assets/*', (req, res) => {
  res.status(404).render('404')
})

// Attach API docs in non-production environments
if (process.env.NODE_ENV !== 'production') {
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

// Catch-all, also passes a btpToken for coil integration of streaming payments
app.use(function (req, res) {
  res.render('main')
})
