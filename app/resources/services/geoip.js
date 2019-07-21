const axios = require('axios')
const redis = require('redis')
const config = require('config')
const chalk = require('chalk')
const logger = require('../../../lib/logger.js')()
const util = require('../../../lib/util.js')

const IP_GEOLOCATION_TIMEOUT = 500

exports.get = function (req, res) {
  // Prevent this service from being accessed by third parties
  if (req.headers.referer === undefined || new URL(req.headers.referer).host !== config.app_host_port) {
    res.status(403).json({ status: 403, msg: 'I’m sorry — you do not have access to this service.' })
    return
  }

  // If API key environment variable has not been provided, return an error.
  if (!config.geoip.api_key) {
    logger.warn(chalk.yellow(
      'A request to ' + chalk.gray('/services/geoip') +
      ' cannot be fulfilled because the ' + chalk.gray('IPSTACK_API_KEY') +
      ' environment variable is not set.'
    ))
    res.status(500).json({ status: 500, msg: 'The server does not have access to the IP geolocation provider.' })
    return
  }

  const requestGeolocation = function (isRedisConnected = true) {
    let url = `${config.geoip.protocol}${config.geoip.host}`
    url += (req.hostname === 'localhost') ? 'check' : ip
    url += `?access_key=${config.geoip.api_key}`

    axios.get(url, { timeout: IP_GEOLOCATION_TIMEOUT })
      .then(response => {
        {
          const body = response.data
          const data = JSON.parse(body)

          // If ipstack returns an error, catch it and return a generic error.
          // Log the error so we can examine it later.
          // Do not use a falsy check here. A succesful response from ipstack does
          // not contain the `success` property. It is only present when it fails.
          if (data.success === false) {
            logger.error(data)
            res.status(500).json({ status: 500, msg: 'The IP geolocation provider returned an error.' })
            return
          }

          if (isRedisConnected && ip) {
            client.set(ip, body, redis.print)
          }

          res.status(200).json(data)
        }
      })
      .catch(error => {
        logger.error(error)
        res.status(503).json({ status: 503, msg: 'The IP geolocation provider is unavailable.' })
      })
  }

  const ip = util.requestIp(req)
  const client = req.redisClient

  // If Redis is connected and Streetmix is not being run locally, check
  // to see if there is a matching key in Redis to the current IP address.
  if (client.connected && req.hostname !== 'localhost') {
    client.get(ip, function (error, reply) {
      if (error || !reply) {
        if (error) {
          logger.error(error)
        }
        // If no matching key or Streetmix is being run locally,
        // or an error occurred, request geolocation from ipstack.
        requestGeolocation()
      } else {
        res.status(200).json(JSON.parse(reply))
      }
    })
  } else {
    // If Redis is not connected and/or Streetmix is being run locally,
    // automatically request geolocation from ipstack and do not save to Redis.
    requestGeolocation(false)
  }
}
