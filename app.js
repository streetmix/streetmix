var fs = require('fs'),
    compression = require('compression'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    express = require('express'),
    request = require('request'),
    assets = require('connect-assets'),
    bodyParser = require('body-parser'),
    url = require('url'),
    config = require('config'),
    controllers = require('./app/controllers'),
    resources = require('./app/resources'),
    requestHandlers = require('./lib/request_handlers');

if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

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
app.set('views', __dirname + '/app/views')

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

app.get('/api/v1/translate/:locale_code', resources.v1.translate.get)

app.get('/.well-known/status', resources.well_known_status.get)

app.use(assets({
  precompile: ['styles.less', 'app.js']
}))
app.use(express.static(__dirname + '/public'))

// Catch-all
app.use(function(req, res) {
  res.render('main', {})
})
