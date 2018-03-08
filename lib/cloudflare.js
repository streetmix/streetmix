'use strict'

const request = require('superagent')
const logger = require('./logger.js')()

/**
 * Requests a cache clear from Cloudflare
 *
 * @returns {Promise}
 */
module.exports = function purgeCache () {
  // If any of the Cloudflare environment variables are not present, fail silently.
  if (!process.env.CLOUDFLARE_ZONE || !process.env.CLOUDFLARE_USER || !process.env.CLOUDFLARE_API_KEY) {
    return
  }

  return request
    .delete(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`)
    .set('X-Auth-Email', process.env.CLOUDFLARE_USER)
    .set('X-Auth-Key', process.env.CLOUDFLARE_API_KEY)
    .set('Content-Type', 'application/json')
    .send({
      files: [
        // We only need to purge the cache for the stylesheet right now.
        'https://streetmix.net/assets/css/styles.css'
      ]
    })
    .then((result) => {
      logger.info(result, 'Cloudflare cache cleared.')
    })
    .catch((err) => {
      logger.error(err)
    })
}
