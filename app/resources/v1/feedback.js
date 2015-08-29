var config = require('config')
var sendgrid = require('sendgrid')(config.email.sendgrid.username, config.email.sendgrid.password)
var validator = require('validator')
var logger = require('../../../lib/logger.js')()

exports.post = function (req, res) {
  var subject = config.email.feedback_subject
  var to = []
  var from
  var body
  var message
  var referer
  var additionalInformation

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
    if (validator.isEmail(body.from)) {
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

  sendgrid.send({
    to: to,
    from: from || config.email.feedback_sender_default,
    subject: subject,
    text: message
  }, function (err, json) {
    if (err) {
      logger.error('Sendgrid: Error sending email. ', json)
      res.status(500).json({ msg: 'Could not send feedback.' })
      return
    }
    logger.info('Sendgrid: Feedback accepted. ', json)
    res.status(202).json({ msg: 'Feedback accepted.' })
  })

} // END function - exports.post
