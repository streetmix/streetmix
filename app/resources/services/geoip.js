const request = require('request')
const redis = require('redis')
const config = require('config')
const logger = require('../../../lib/logger.js')()
const util = require('../../../lib/util.js')

const IP_GEOLOCATION_TIMEOUT = 500

exports.get = function (req, res) {
  if (req.headers.referer === undefined || new URL(req.headers.referer).host !== config.app_host_port) {
    res.status(403).json({ status: 403, error: 'Not allowed to access API' })
    return
  }

  const requestGeolocation = function (isRedisConnected = true) {
    let url = `${config.geoip.protocol}${config.geoip.host}`
    url += (req.hostname === 'localhost') ? 'check' : ip
    url += `?access_key=${config.geoip.api_key}`

    request(url, { timeout: IP_GEOLOCATION_TIMEOUT }, function (error, response, body) {
      if (error) {
        logger.error(error)
        res.status(503).json({ status: 503, error: 'Service unavailable' })
        return
      }

      const data = JSON.parse(body)

      // If ipstack returns an error, catch it and return a generic error.
      // Log the error so we can examine it later.
      // Do not use a falsy check here. A succesful response from ipstack does
      // not contain the `success` property. It is only present when it fails.
      if (data.success === false) {
        logger.error(data)
        res.status(500).json({ status: 500, error: 'Geoip service error' })
        return
      }

      if (isRedisConnected && ip) {
        client.set(ip, body, redis.print)
      }

      res.status(200).json(data)
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
