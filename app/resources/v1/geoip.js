const config = require('config')
const request = require('request')
const logger = require('../../../lib/logger.js')()
const redis = require('redis')
const url = require('url')

const IP_GEOLOCATION_TIMEOUT = 500

exports.get = function (req, res) {
  if (req.headers.host !== config.app_host_port) {
    res.status(403).json({ status: 403, error: 'Not allowed to access API' })
    return
  }

  const requestGeolocation = function (isRedisConnected = true) {
    console.log('requesting geolocation')
    const url = `${config.geoip.protocol}${config.geoip.host}?access_key=${config.geoip.api_key}`

    request(url, { timeout: IP_GEOLOCATION_TIMEOUT }, function (error, response, body) {
      if (error) {
        logger.error(error)
        // Error codes 101 and 104 are provided by ipstack to specify invalid/missing api key
        // and maximum monthly API requests reached, respectively. Since ipstack already has
        // error messages included with these errors, just send the message to the front-end.
        if (error.code === 101 || error.code === 104) {
          res.status(error.code).json({ status: error.code, error: error.info })
        } else if (error.code === 'ETIMEDOUT') {
          // If request takes longer than declared IP_GEOLOCATION_TIMEOUT, return status code 408
          res.status(408).json({ status: 408, error: 'Request timed out' })
        }
        return
      }

      if (isRedisConnected && req.ip) {
        client.set(req.ip, body, redis.print)
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

  const authenticateRedis = function () {
    return new Promise(function (resolve, reject) {
      if (config.redis.secret) {
        client.auth(config.redis.secret, function (err) {
          if (err) {
            reject(err)
          } else {
            resolve('success')
          }
        })
      } else {
        resolve('success')
      }
    })
  }

  let client
  if (config.redis.redis_to_go_url) {
    const rtg = url.parse(process.env.REDISTOGO_URL)
    client = redis.createClient(rtg.port, rtg.hostname)
  } else {
    client = redis.createClient(config.redis.port, req.hostname)
  }

  // If Redis cache not connecting, stop trying to connect, log the error,
  // and request geolocation from ipstack.
  client.on('error', (error) => { handleRedisErrors(error, false) })

  client.on('connect', function () {
    console.log('Connected to Redis')

    const authenticated = authenticateRedis()
    authenticated.then(function (result) {
      client.get(req.ip, function (error, reply) {
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
    }, logger.error)
  })
}
