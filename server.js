var express = require('express'),
    lessMiddleware = require('less-middleware'),
    config = require('config');

var app = express()

app.use(express.compress())

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

app.listen(config.port, null, null, function() {
  console.log('Listening on port ' + config.port)
});
