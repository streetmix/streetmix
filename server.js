var fs = require('fs'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    url = require('url'),
    config = require('config'),
    controllers = require('./app/controllers'),
    resources = require('./app/resources'),
    requestHandlers = require('./lib/request_handlers');

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

var app = express()

app.locals.config = config

app.use(bodyParser.json())
app.use(compression())
app.use(cookieParser())
app.use(cookieSession({ secret: config.cookie_session_secret }))

app.use(requestHandlers.login_token_parser)
app.use(requestHandlers.request_log)
app.use(requestHandlers.request_id_echo)

app.use(app.router);

app.set('view engine', 'ejs')
app.set('views', __dirname + '/app/views')

// Redirect to environment-appropriate domain, if necessary
app.all('*', function(req, res, next) {
  if (config.header_host_port != req.headers.host) {
    var redirectUrl = 'http://' + config.header_host_port + req.url
    console.log('req.host = %s but config.header_host_port = %s; redirecting to %s...', req.host, config.header_host_port, redirectUrl)
    res.redirect(301, redirectUrl)
  } else {
    next('route')
  }
})

app.use(require("connect-assets")());
app.use(express.static(__dirname + '/public'))

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(config.twitter.oauth_callback_uri, controllers.twitter_sign_in_callback.get)

app.post('/api/v1/users', resources.v1.users.post)
app.get('/api/v1/users/:user_id', resources.v1.users.get)
app.put('/api/v1/users/:user_id', resources.v1.users.put)
app.del('/api/v1/users/:user_id/login-token', resources.v1.users.delete)
app.get('/api/v1/users/:user_id/streets', resources.v1.users_streets.get)

app.post('/api/v1/streets', resources.v1.streets.post)
app.get('/api/v1/streets', resources.v1.streets.find)
app.head('/api/v1/streets', resources.v1.streets.find)

app.del('/api/v1/streets/:street_id', resources.v1.streets.delete)
app.head('/api/v1/streets/:street_id', resources.v1.streets.get)
app.get('/api/v1/streets/:street_id', resources.v1.streets.get)
app.put('/api/v1/streets/:street_id', resources.v1.streets.put)

app.post('/api/v1/feedback', resources.v1.feedback.post)

app.get('/.well-known/status', resources.well_known_status.get)

app.get('/help/about-beta', function(req, res) {
  res.sendfile(__dirname + '/public/help/about-beta/index.html')
})

app.get('/favicon.ico', function(req, res) {
  res.sendfile(__dirname + '/public/favicon.ico')
})

// Catch-all
app.use(function(req, res) {
  res.render('index', {})
})

app.listen(config.port, null, null, function() {
  console.log('Listening on port ' + config.port)
});
