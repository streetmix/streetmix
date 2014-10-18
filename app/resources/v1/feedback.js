var config = require('config'),
    SendGrid = require('sendgrid').SendGrid,
    validator = require('validator'),
    logger = require('../../../lib/logger.js')();

exports.post = function(req, res) {

  // Validation
  var body
  try {
    body = req.body
  } catch (e) {
    res.status(400).json({msg: 'Could not parse body as JSON.' })
    return
  }

  if (!body.hasOwnProperty('message') || (body.message.trim().length === 0)) {
    res.status(400).json({msg: 'Please specify a message.' })
    return
  }
  var message = body.message.trim()

  // Log feedback
  logger.info(body, 'Feedback received.')

  // Append useful information to message
  var referer = req.headers.referer || '(not specified)'
  var additionalInformation = body.additionalInformation || ''

  message += "\n\n"
    + "-- \n"
    + "URL: " + referer + "\n"
    + additionalInformation

  var to = [ config.email.feedback_recipient ]
  var from
  if (body.from) {
    try {
      validator.check(body.from).isEmail()
      from = body.from
      to.push(body.from)
    } catch (e) {
      message += "\n"
        + "Invalid from email address specified: " + body.from + "\n"
    } 
  }
      
  var sendgrid = new SendGrid(
    config.email.sendgrid.username,
    config.email.sendgrid.password
  )

  var subject = config.email.feedback_subject;
  if (from) {
    subject += ' from ' + from;
  }

  sendgrid.send({
    to: to,
    from: from || config.email.feedback_sender_default,
    subject: subject,
    text: message
  }, function(success, message) {
    if (!success) {
      logger.error('Error sending email using SendGrid: ' + message)
      res.status(500).json({msg: 'Could not send feedback.' })
      return
    }
    res.status(202).json({msg: 'Feedback accepted.' })
  })

} // END function - exports.post
