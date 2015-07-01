var dateformat = require('dateformat'),
  logger = require('../../lib/logger')()

module.exports = function (req, res, next) {
  var loginToken = ''
  if (req.loginToken) {
    loginToken = req.loginToken
  }
  var contentType = req.headers['content-type'] || ''
  var body = req.body || ''
  var now = new Date()
  var date = dateformat(now, 'm/d/yyyy H:MM:ss Z')
  logger.debug({ method: req.method, url: req.url, content_type: contentType, login_token: loginToken})
  next()
}
