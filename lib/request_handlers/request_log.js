var logger = require('../../lib/logger')()

module.exports = function (req, res, next) {
  var loginToken = req.loginToken || ''
  var contentType = req.headers['content-type'] || ''

  logger.debug({
    method: req.method,
    url: req.url,
    content_type: contentType,
    login_token: loginToken
  })

  next()
}
