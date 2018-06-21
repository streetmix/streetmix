const config = require('config')
const sendgrid = require('@sendgrid/mail')
const isEmail = require('validator/lib/isEmail')
const logger = require('../../../lib/logger.js')()

sendgrid.setApiKey(config.email.sendgrid.api_key)

exports.post = function (req, res) {
  const to = []
  let from
  let subject = config.email.feedback_subject
  let body
  let message
  let referer
  let additionalInformation

  to.push(config.email.feedback_recipient)

  // Validate body text
  try {
    body = req.body
  } catch (e) {
    res.status(400).json({ msg: 'Could not parse body as JSON.' })
    return
  }

  if (!body.hasOwnProperty('message') || (body.message.trim().length === 0)) {
    res.status(400).json({ msg: 'Please specify a message.' })
    return
  }

  message = body.message.trim()

  // Log feedback
  logger.info(body, 'Feedback received.')

  // Append referring URL
  referer = req.headers.referer || '(not specified)'

  message += '\n\n--\nURL: ' + referer

  // Validate and add from e-mail address
  if (body.from) {
    if (isEmail(body.from)) {
      from = body.from
      to.push(body.from)
      subject += ' from ' + from
    } else {
      message += '\nInvalid from email address specified: ' + body.from + '\n'
    }
  }

  // Append other useful information to message
  additionalInformation = body.additionalInformation || ''
  message += '\n' + additionalInformation

  const msg = {
    to: to,
    from: from || config.email.feedback_sender_default,
    subject: subject,
    text: message
  }

  sendgrid
    .send(msg)
    .then(() => {
      logger.info('Sendgrid: Feedback accepted. ', msg)
      res.status(202).json({ msg: 'Feedback accepted.' })
    })
    .catch((error) => {
      logger.error('Sendgrid: Error sending email. ', error, msg)
      res.status(500).json({ msg: 'Could not send feedback. Error: ' + error })
    })
} // END function - exports.post
