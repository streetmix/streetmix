const config = require('config')
const { isEmail } = require('validator')
const { Authentication } = require('../../lib/auth0')
const logger = require('../../lib/logger.js')()

exports.post = async function (req, res) {
  let body
  try {
    body = req.body
  } catch (e) {
    res.status(400).send('Could not parse body as JSON.')
    return
  }

  if (!body.email) {
    res.status(400).send('Please provide your email')
    return
  }

  if (!isEmail(body.email)) {
    res.status(400).send('Please ensure your email is valid')
    return
  }
  const email = body.email
  const data = {
    email: email,
    send: 'link',
    authParams: {
      redirect_uri: config.auth0.email_callback_uri
    }
  }

  try {
    const auth0 = Authentication()
    await auth0.passwordless.sendEmail(data)
  } catch (err) {
    logger.error(err)
    res.status(500).send('Unable to send Email at the moment')
  }
}

exports.get = function (req, res) {
  console.log(req.query)
  res.status(200).send('Callback received')
}
