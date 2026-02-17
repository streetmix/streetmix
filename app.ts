import './app/globals.js'
import path from 'node:path'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import express from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import chalk from 'chalk'
import passport from 'passport'

import * as controllers from './app/controllers/index.js'
import * as requestHandlers from './app/lib/request_handlers/index.js'
import { initCloudinary } from './app/lib/cloudinary.ts'
import { compileSVGSprites } from './app/lib/svg_sprite.ts'
import { appURL } from './app/lib/url.ts'
import apiRoutes from './app/api_routes.js'
import serviceRoutes from './app/service_routes.js'
import { logger } from './app/lib/logger.ts'
import jwtCheck from './app/authentication.js'

initCloudinary()

// Build SVG sprites before starting Express server
await Promise.all([
  compileSVGSprites('packages/variant-icons/icons/', 'icons', 'icon'),
  compileSVGSprites('client/images/illustrations', 'illustrations', 'image'),
  compileSVGSprites('packages/illustrations/images/', 'images', 'image'),
])

const app = express()
export default app

// Get the timestamp of this server's start time to use as a cachebusting filename.
const cacheTimestamp = Date.now()
app.locals.cacheTimestamp = cacheTimestamp

process.on('uncaughtException', function (error) {
  logger.error(
    '[process] ' + chalk.redBright.bold('Uncaught exception: ') + error
  )

  console.trace()
  process.exit(1)
})

// Provide a message after a Ctrl-C
// Note: various sources tell us that this does not work on Windows
process.on('SIGINT', function () {
  if (process.env.NODE_ENV === 'development') {
    logger.info('[express] ' + chalk.yellowBright.bold('Stopping Streetmix!'))
  }
  process.exit()
})

// Pass environment variables to handlebars templates
app.locals.env = {
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  WEB_MONETIZATION_PAYMENT_POINTER:
    process.env.WEB_MONETIZATION_PAYMENT_POINTER,
}

// Not all headers from `helmet` are on by default. These turns on specific
// off-by-default headers for better security as recommended by https://securityheaders.io/
const helmetConfig = {
  frameguard: false, // Allow Streetmix to be iframed in 3rd party sites
  contentSecurityPolicy: false, // These are set explicitly later
  crossOriginEmbedderPolicy: false, // Load external assets
  hsts: {
    maxAge: 5184000, // 60 days
    includeSubDomains: false, // we don't have a wildcard ssl cert
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
}

// CSP directives are defined separately so we can generate nonces
const csp = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'checkout.stripe.com'],
    scriptSrc: [
      "'self'",
      'platform.twitter.com',
      process.env.AUTH0_DOMAIN,
      '*.basemaps.cartocdn.com',
      process.env.PELIAS_HOST_NAME,
      'checkout.stripe.com',
      'plausible.io',
      'static.cloudflareinsights.com',
    ],
    workerSrc: ["'self'"],
    childSrc: ['platform.twitter.com'],
    frameAncestors: ["'self'", 'https:'],
    frameSrc: ["'self'", 'streetmix.github.io', 'checkout.stripe.com'],
    imgSrc: [
      "'self'",
      // Save-as-image
      'blob:',
      'data:',
      // Maps
      '*.basemaps.cartocdn.com',
      // Profile images
      'abs.twimg.com',
      'pbs.twimg.com',
      // Other
      '*.stripe.com',
    ],
    objectSrc: [
      "'self'",
      // Profile images
      'abs.twimg.com',
      'pbs.twimg.com',
      'syndication.twitter.com',
      'platform-lookaside.fbsbx.com',
      's.gravatar.com',
      '*.googleusercontent.com',
      'res.cloudinary.com',
      '*.wp.com/cdn.auth0.com', // Auth0 default profile images
    ],
    fontSrc: ["'self'"],
    connectSrc: [
      "'self'",
      process.env.PELIAS_HOST_NAME,
      'syndication.twitter.com',
      'sentry.io',
      process.env.AUTH0_DOMAIN,
      'checkout.stripe.com',
      'plausible.io',
      'buttondown.com',
      'buttondown.email',
      'cloudflareinsights.com',
    ],
    reportUri: '/services/csp-report/',
  },
  // Report (but do not block) CSP violations in development mode.
  // This allows developers to work on new or experimental features without
  // worrying about modifying CSP headers.
  // !! WARNING !!
  // Reported CSP violations should be addressed before releasing to
  // production. IF A NEW FEATURE IS REPORTING A CSP VIOLATION, IT WILL
  // FAIL IN PRODUCTION, EVEN THOUGH IT WORKS IN DEVELOPMENT MODE.
  reportOnly: process.env.NODE_ENV === 'development',
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
    sameSite: 'strict',
  })
)

app.use(requestHandlers.requestLog)
app.use(requestHandlers.requestIdEcho)

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
    height: 522,
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
app.set('views', path.join(import.meta.dirname, '/app/views'))

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

// Attach API docs in non-production environments
if (process.env.NODE_ENV !== 'production') {
  const options = {
    definition: {
      info: {
        title: 'Streetmix',
        version: process.env.npm_package_version,
      },
    },
    apis: ['app/api_routes.js', 'app/service_routes.js'],
  }
  const displayOptions = {
    customCss: '.swagger-ui .topbar { display: none }',
  }
  const swaggerSpec = swaggerJSDoc(options)

  // This route must be defined before the catch-all handler of `/api/*`
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, displayOptions)
  )
}

// API routes
app.use('/api', apiRoutes)
app.use('/services', serviceRoutes)

app.use('/assets', express.static(path.join(import.meta.dirname, '/build')))
// Not sure if this sticks around forever, but it's a good way to serve static files
// for templates, this can go away once the responsibility for making new streets and
// processing template data entirely happens server side, which it may as well
app.use(
  '/assets/data',
  express.static(path.join(import.meta.dirname, '/app/data'))
)
app.use(express.static(path.join(import.meta.dirname, '/public')))

// Catch-all for broken asset paths.
// Matches '/images/*'
app.all(/\/images\/.*/, (req, res) => {
  res.status(404).render('404')
})
// Matches '/assets/*'
app.all(/\/assets\/.*/, (req, res) => {
  res.status(404).render('404')
})

app.get(
  ['/:user_id/:namespacedId', '/:user_id/:namespacedId/:street_name'],
  requestHandlers.metatags
)

// Catch-all, also passes a btpToken for coil integration of streaming payments
app.use(function (req, res) {
  res.render('main')
})
