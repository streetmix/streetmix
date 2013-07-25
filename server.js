var fs = require('fs'),
    express = require('express'),
    request = require('request'),
    url = require('url'),
    lessMiddleware = require('less-middleware'),
    config = require('config'),
    mustache = require('mustache'),
    controllers = require('./app/controllers')
    
var app = express()

app.use(express.compress())
app.use(express.cookieParser())
app.use(express.cookieSession({ secret: config.cookie_session_secret }))

app.use(lessMiddleware({
  src: __dirname + '/public',
  compress: (process.env.NODE_ENV == 'production'),
  once: (process.env.NODE_ENV == 'production')
}))

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

app.use(express.static(__dirname + '/public'))

app.get('/twitter-sign-in', controllers.twitter_sign_in.get)
app.get(config.twitter.oauth_callback_uri, controllers.twitter_sign_in_callback.get)

app.all('*', function(req, res, next) {
  var apiUrlRegexp = new RegExp("^" + config.restapi_proxy_baseuri_rel)
  if (req.url.match(apiUrlRegexp)) {

    var targetUri = config.restapi_baseuri + req.url.replace(apiUrlRegexp, '')

    var headers = req.headers
    headers.host = url.parse(config.restapi_baseuri).hostname

    req.pipe(request({
      method: req.method,
      uri: targetUri,
      headers: headers,
      followRedirect: true
    })).pipe(res)
      
  } else {
    next('route')
  }
})

app.get('/help/about-beta', function(req, res) {
  res.sendfile(__dirname + '/public/help/about-beta/index.html')
})

// Catch-all
app.use(function(req, res) {
  res.sendfile(__dirname + '/public/index.html')
})

fs.readFile(__dirname + '/public/js/scripts.mustache.js', { encoding: 'utf8' }, function(err, data) {

  if (err) {
    console.error('Could not read JS files for compilation.')
    return process.exit(1)
  }

  var replaced = mustache.render(data, config)

  fs.writeFile(__dirname + '/public/js/scripts.AUTO.js', replaced, { encoding: 'utf8' }, function(err) {

    if (err) {
      console.error('Could not write compiled JS files')
      return process.exit(2)
    }
    
    app.listen(config.port, null, null, function() {
      console.log('Listening on port ' + config.port)
    });

  }) // END - fs.writeFile

}) // END - fs.readFile
