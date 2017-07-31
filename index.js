var app = require('./app')
console.log('here ', app.locals.config)
app.listen(app.locals.config.port, null, null, function () {
  console.log('Listening on port ' + app.locals.config.port)
})
