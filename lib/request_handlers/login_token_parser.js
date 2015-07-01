var util = require(__dirname + '/../util.js')

module.exports = function (req, res, next) {
  req.loginToken = util.parseLoginToken(req)
  next()
}
