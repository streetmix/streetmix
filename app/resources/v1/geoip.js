const config = require('config')
const request = require('request')
const logger = require('../../../lib/logger.js')()

const IP_GEOLOCATION_TIMEOUT = 500

var redis = require('redis')
var client = redis.createClient('12000', '127.0.0.1', {no_ready_check: true})

client.on('connect', function () {
  console.log('Connected to Redis')
})

exports.get = function (req, res) {
  if (req.headers.host !== config.app_host_port) {
    res.status(403).json({ error: 'Not allowed to access API' })
    return
  }

  const requestGeolocation = function () {
    console.log('requesting geolocation')
    const url = `${config.geoip.protocol}${config.geoip.host}?access_key=${config.geoip.api_key}`

    request(url, { timeout: IP_GEOLOCATION_TIMEOUT }, function (error, response, body) {
      if (error) {
        logger.error(error)
        // Error codes 101 and 104 are provided by ipstack to specify invalid/missing api key
        // and maximum monthly API requests reached, respectively. Since ipstack already has
        // error messages included with these errors, just send the message to the front-end.
        if (error.code === 101 || error.code === 104) {
          res.status(error.code).json({ error: error.info })
        } else if (error.code === 'ETIMEDOUT') {
          // If request takes longer than declared IP_GEOLOCATION_TIMEOUT, return status code 408
          res.status(408).json({ error: 'Request timed out' })
        }
        return
      }

      client.set(req.ip, body, redis.print)
      res.status(200).send(body)
    })
  }

  client.get(req.ip, function (err, reply) {
    if (err) {
      console.log(err)
      return
    }

    if (!reply) {
      requestGeolocation()
    } else {
      res.status(200).send(reply)
    }
  })
}
