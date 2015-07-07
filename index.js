var app = require('./app')

app.listen(app.locals.config.port, null, null, function () {
  console.log('Listening on port ' + app.locals.config.port)

  if (app.locals.config.env === 'development') {
    console.log('To shutdown cleanly, press Ctrl-C and then run "npm stop" to shut down MongoDB')
  }
})
