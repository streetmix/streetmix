var express = require('express'),
    lessMiddleware = require('less-middleware'),
    config = require('config'),
    controllers = require('./app/controllers')

var app = express()

app.use(express.compress())
app.use(express.cookieParser())
app.use(express.cookieSession({ secret: 'seger handrail' }))

app.use(lessMiddleware({
  src: __dirname + '/public',
  compress: (process.env.NODE_ENV == 'production'),
  once: (process.env.NODE_ENV == 'production')
}))

// Redirect to environment-appropriate domain, if necessary
app.all('*', function(req, res, next) {
  if (config.app_host_port != req.headers.host) {
    var redirectUrl = 'http://' + config.app_host_port + req.url
    console.log('Redirecting to ' + redirectUrl + '...')
    res.redirect(301, redirectUrl)
  } else {
    next('route')
  }
})

app.use(express.static(__dirname + '/public'))

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(config.twitter.oauth_callback_uri, controllers.twitter_sign_in_callback.get)

// Catch-all
app.use(function(req, res) {
  res.sendfile(__dirname + '/public/index.html')
})


app.listen(config.port, null, null, function() {
  console.log('Listening on port ' + config.port)
});
