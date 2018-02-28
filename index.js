const app = require('./app')

app.listen(app.locals.config.port, () => {
  console.log('Listening on port ' + app.locals.config.port)
})
