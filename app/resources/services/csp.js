const chalk = require('chalk')
const logger = require('../../../lib/logger.js')()

exports.post = (req, res) => {
  logger.warn(
    '[csp] ' +
      chalk.underline.inverse(
        'A Content Security Policy directive violation has been reported:\n'
      ) +
      chalk.green(JSON.stringify(req.body, null, 2))
  )
  res.status(204).end()
}
