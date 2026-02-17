import chalk from 'chalk'
import { logger } from '../../lib/logger.ts'

export function post(req, res) {
  const cspReport = req.body['csp-report']

  // Early exit if a POST did not contain the report body
  if (!cspReport) {
    res.status(400).end()
    return
  }

  // Some scripts are intentionally blocked. Therefore, logging the report
  // every time they occur is not useful. This might be expanded to handle
  // multiple use cases abstractly, but for now, we handle cases specifically
  if (
    cspReport['blocked-uri'].startsWith('https://platform.twitter.com') ||
    cspReport['blocked-uri'].endsWith('__parcel_code_frame') ||
    cspReport['blocked-uri'] === 'eval' ||
    cspReport['source-file'] === 'moz-extension'
  ) {
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
        'https://docs.streetmix.net/contributing/code/reference/csp'
      )
  )
  res.status(204).end()
}
