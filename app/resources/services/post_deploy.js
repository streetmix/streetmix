const purgeCache = require('../../../lib/cloudflare.js')

/**
 * After a deploy, Heroku can be set up with an HTTP deploy hook that POSTs
 * a payload to the `/services/post-deploy/` URL, which is handled here.
 *
 * @param {Object} req
 * @param {Object} res
 */
exports.post = (req, res) => {
  const payload = req.body

  // Reject empty or invalid payloads
  if (Object.keys(payload).length === 0) {
    res.status(400).send()
    return
  }

  // Cloudflare - clear stylesheet cache
  purgeCache()

  res.status(202).send()
}
