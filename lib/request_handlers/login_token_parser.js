var util = require('../util.js')

module.exports = function (req, res, next) {
  const auth = util.parseLoginToken(req)
  req.loginToken = auth && auth.loginToken
  req.userId = auth && auth.userId
  next()
}
