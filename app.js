// Run this before other modules
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic')
}

var compression = require('compression')
var cookieParser = require('cookie-parser')
var cookieSession = require('cookie-session')
var envify = require('envify/custom')
var express = require('express')
var browserify = require('browserify-middleware')
var babelify = require('babelify')
var bodyParser = require('body-parser')
var config = require('config')
var path = require('path')
var controllers = require('./app/controllers')
var resources = require('./app/resources')
var requestHandlers = require('./lib/request_handlers')
var middleware = require('./lib/middleware')
var exec = require('child_process').exec

var app = module.exports = express()

app.locals.config = config

app.use(bodyParser.json())
app.use(compression())
app.use(cookieParser())
app.use(cookieSession({ secret: config.cookie_session_secret }))

app.use(requestHandlers.login_token_parser)
app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

app.set('view engine', 'jade')
app.set('views', path.join(__dirname, '/app/views'))

// Redirect to environment-appropriate domain, if necessary
app.all('*', function (req, res, next) {
  if (config.header_host_port !== req.headers.host && app.locals.config.env !== 'development') {
    var redirectUrl = 'https://' + config.header_host_port + req.url
    console.log('req.hostname = %s but config.header_host_port = %s; redirecting to %s...', req.hostname, config.header_host_port, redirectUrl)
    res.redirect(301, redirectUrl)
  } else {
    next('route')
  }
})

app.get('/help/about', function (req, res) {
  res.redirect('https://www.opencollective.com/streetmix/')
})

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(config.twitter.oauth_callback_uri, controllers.twitter_sign_in_callback.get)

app.post('/api/v1/users', resources.v1.users.post)
app.get('/api/v1/users/:user_id', resources.v1.users.get)
app.put('/api/v1/users/:user_id', resources.v1.users.put)
app.delete('/api/v1/users/:user_id/login-token', resources.v1.users.delete)
app.get('/api/v1/users/:user_id/streets', resources.v1.users_streets.get)

app.post('/api/v1/streets', resources.v1.streets.post)
app.get('/api/v1/streets', resources.v1.streets.find)
app.head('/api/v1/streets', resources.v1.streets.find)

app.delete('/api/v1/streets/:street_id', resources.v1.streets.delete)
app.head('/api/v1/streets/:street_id', resources.v1.streets.get)
app.get('/api/v1/streets/:street_id', resources.v1.streets.get)
app.put('/api/v1/streets/:street_id', resources.v1.streets.put)

app.post('/api/v1/feedback', resources.v1.feedback.post)

app.get('/api/v1/translate/:locale_code/:resource_name', resources.v1.translate.get)

app.get('/.well-known/status', resources.well_known_status.get)

// Process stylesheets via Sass and PostCSS / Autoprefixer
app.use('/assets/css/styles.css', middleware.styles)

app.get('/assets/scripts/main.js', browserify(path.join(__dirname, '/assets/scripts/main.js'), {
  cache: true,
  precompile: true,
  extensions: [ '.jsx' ],
  transform: [babelify, envify({
    APP_HOST_PORT: config.get('app_host_port'),
    FACEBOOK_APP_ID: config.get('facebook_app_id'),
    API_URL: config.get('restapi_proxy_baseuri_rel'),
    TWITTER_CALLBACK_URI: config.get('twitter').oauth_callback_uri,
    ENV: config.get('env'),
    NO_INTERNET_MODE: config.get('no_internet_mode')
  })]
}))

// SVG bundled images served directly from packages
app.get('/assets/images/icons.svg', function (req, res) {
  res.sendFile(path.join(__dirname, '/node_modules/streetmix-icons/dist/icons.svg'))
})

app.get('/assets/images/images.svg', function (req, res) {
  res.sendFile(path.join(__dirname, '/node_modules/streetmix-illustrations/dist/images.svg'))
})

// Let's encrypt
app.get('/.well-known/acme-challenge/:content', function (req, res) {
  if (req.params.content === '7pdEii0_x8CMKs4_-dxxMqZEjyG6kf1kqvQyCAWwX0o') {
    res.send('7pdEii0_x8CMKs4_-dxxMqZEjyG6kf1kqvQyCAWwX0o.l9FkLMU3VDDT2G0Jl6bjhubMR7F5KYti6fYByoOIMrY')
  } else {
    res.status(403).end()
  }
})

app.use(express.static(path.join(__dirname, '/public')))

// Catch-all
app.use(function (req, res) {
  res.render('main', {})
})

// Provide a message after a Ctrl-C
// Note: various sources tell us that this does not work on Windows
process.on('SIGINT', function () {
  if (app.locals.config.env === 'development') {
    console.log('Stopping Streetmix!')
    exec('npm stop')
  }
  process.exit()
})
