import chalk from 'chalk'
import app from './app.mjs'
import logger from './app/lib/logger.mjs'

app.listen(process.env.PORT, () => {
  if (process.env.NODE_ENV === 'development') {
    logger.info(
      chalk`[express] {yellow.bold Streetmix is starting!} {white.bold Go here in your browser:} {greenBright.bold http://localhost:${process.env.PORT}}`
    )
  } else {
    logger.info(chalk`[express] {yellow.bold Streetmix is starting!}`)
  }

  if (process.env.OFFLINE_MODE === 'true') {
    logger.info(
      chalk`[express] {cyan.bold Offline mode is} {white.bold ON}{cyan.bold .}`
    )
  }
})
