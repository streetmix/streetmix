const config = require('config')
const request = require('request')
const logger = require('../../../lib/logger.js')()

exports.get = function (req, res) {
  if (req.headers.host !== config.app_host_port) return

  const url = `http://${config.geoip.host}?access_key=${config.geoip.api_key}`

  request(url, { json: true }, function (error, response, body) {
    if (error) {
      logger.error(error)
      return
    }

    res.status(200).send(body)
  })
}
