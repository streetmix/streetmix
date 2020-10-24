const chalk = require('chalk')
const logger = require('../../../lib/logger.js')()

exports.post = (req, res) => {
  logger.warn(
    '[csp-report] 🚨 ' +
      chalk.yellowBright.bold(
        'A Content Security Policy (CSP) directive violation has been reported:\n'
      ) +
      chalk.green(JSON.stringify(req.body, null, 2)) +
      '\n' +
      chalk.yellowBright.bold(
        'If this is unexpected, please add this resource to the CSP directive. See '
      ) +
      chalk.yellowBright.underline(
        'https://streetmix.readthedocs.io/en/latest/technical/csp'
      )
  )
  res.status(204).end()
}
