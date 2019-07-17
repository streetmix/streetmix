const logger = require('../../lib/logger')()

module.exports = function (req, res, next) {
  const loginToken = req.loginToken || ''
  const userId = req.userId || ''
  const contentType = req.headers['content-type'] || ''

  logger.debug({
    method: req.method,
    url: req.url,
    content_type: contentType,
    login_token: loginToken,
    user_id: userId
  })

  next()
}
