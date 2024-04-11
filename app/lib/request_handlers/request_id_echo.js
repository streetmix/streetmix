export default function (req, res, next) {
  const requestId = req.header('X-Streetmix-Request-Id')

  if (requestId) {
    res.header('X-Streetmix-Request-Id', requestId)
  }

  next()
}
