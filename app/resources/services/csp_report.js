const chalk = require('chalk')
const logger = require('../../../lib/logger.js')()

exports.post = (req, res) => {
  const cspReport = req.body.cspReport

  // Early exit if a POST did not contain the report body
  if (!cspReport) {
    res.status(400).end()
    return
  }

  // Some scripts are intentionally blocked. When that's the case we silence
  // the report instead of logging it. This might be expanded to handle
  // multiple use cases abstractly, but for now, we handle cases specifically
  if (cspReport['blocked-uri'] === 'https://platform.twitter.com') {
    res.status(204).end()
    return
  }

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
