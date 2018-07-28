const request = require('request')
const redis = require('redis')
const url = require('url')
const util = require('util')
const config = require('config')
const logger = require('../../../lib/logger.js')()

const IP_GEOLOCATION_TIMEOUT = 500

exports.get = function (req, res) {
  if (req.headers.host !== config.app_host_port) {
    res.status(403).json({ status: 403, error: 'Not allowed to access API' })
    return
  }

  const requestIp = function (req) {
    if (req.headers['x-forwarded-for'] !== undefined) {
      return req.headers['x-forwarded-for'].split(', ')[0]
    } else {
      return req.connection.remoteAddress
    }
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

      if (isRedisConnected && ip) {
        client.set(ip, body, redis.print)
      }

      res.status(200).send(body)
    })
  }

  const handleRedisErrors = function (error, isRedisConnected = true) {
    // If any errors involving Redis, log the error and then request geolocation
    // directly from ipstack.
    logger.error(error)
    if (!isRedisConnected) {
      client.end(true)
    }
    requestGeolocation(isRedisConnected)
  }

  const ip = requestIp(req)

  let client, redisInfo
  if (config.redis.url) {
    redisInfo = url.parse(config.redis.url)
    client = redis.createClient(redisInfo.port, redisInfo.hostname)
  } else {
    client = redis.createClient(config.redis.port, req.hostname)
  }

  // If Redis cache not connecting, stop trying to connect, log the error,
  // and request geolocation from ipstack.
  client.on('error', (error) => { handleRedisErrors(error, false) })

  client.on('connect', function () {
    console.log('Connected to Redis')

    const authenticateRedis = util.promisify(client.auth).bind(client)
    const redisAuth = (config.redis.url && redisInfo) ? redisInfo.auth.split(':')[1] : config.redis.password

    authenticateRedis(redisAuth)
      .then((result) => {
        client.get(ip, function (error, reply) {
          if (error) {
            handleRedisErrors(error)
            return
          }

          if (!reply || req.hostname === 'localhost') {
            // If no matching key or Streetmix is being run locally,
            // request geolocation from ipstack.
            requestGeolocation()
          } else {
            res.status(200).send(reply)
          }
        })
      })
      .catch((error) => {
        logger.error(error)
      })
  })
}
