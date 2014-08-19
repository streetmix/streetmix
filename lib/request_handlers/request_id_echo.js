module.exports = function(req, res, next) {
  
  var requestId = req.header('X-Streetmix-Request-Id')
  if (requestId) {
      res.header('X-Streetmix-Request-Id', requestId)
  }
  next()

}