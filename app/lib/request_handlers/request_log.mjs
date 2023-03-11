import logger from '../logger.mjs'

export default function (req, res, next) {
  const contentType = req.headers['content-type'] || ''

  logger.debug({
    method: req.method,
    url: req.url,
    content_type: contentType,
    user_id: req.cookies.user_id
  })

  next()
}
