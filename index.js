var app = require('./app')

app.listen(app.locals.config.port, null, null, function () {
  console.log('Listening on port ' + app.locals.config.port)
})
