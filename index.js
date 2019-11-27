const chalk = require('chalk')
const app = require('./app')
const logger = require('./lib/logger.js')()

app.listen(app.locals.config.port, () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(
      chalk`[app] {yellow.bold Streetmix is running!} {white.bold Go here in your browser:} {greenBright.bold http://localhost:${app.locals.config.port}}`
    )
  } else {
    logger.info(chalk`[app] {yellow.bold Streetmix is running!}`)
  }
})
