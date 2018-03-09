'use strict'

const axios = require('axios')
const logger = require('./logger.js')()

/**
 * Requests a cache clear from Cloudflare
 *
 * @returns {Promise}
 */
module.exports = async function purgeCache () {
  // If any of the Cloudflare environment variables are not present, fail silently.
  if (!process.env.CLOUDFLARE_ZONE || !process.env.CLOUDFLARE_USER || !process.env.CLOUDFLARE_API_KEY) {
    return
  }

  try {
    const response = await axios.request({
      url: `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE}/purge_cache`,
      method: 'delete',
      headers: {
        'X-Auth-Email': process.env.CLOUDFLARE_USER,
        'X-Auth-Key': process.env.CLOUDFLARE_API_KEY,
        'Content-Type': 'application/json'
      },
      data: {
        files: [
          // We only need to purge the cache for the stylesheet right now.
          'https://streetmix.net/assets/css/styles.css'
        ]
      }
    })

    logger.info(response, 'Cloudflare cache cleared.')
  } catch (error) {
    logger.error(error)
  }
}
