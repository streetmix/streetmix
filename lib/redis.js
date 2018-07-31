const redis = require('redis')
const config = require('config')
const url = require('url')
const logger = require('./logger.js')()

let client, redisInfo
if (config.redis.url) {
  redisInfo = url.parse(config.redis.url)
  client = redis.createClient(redisInfo.port, redisInfo.hostname)
} else {
  client = redis.createClient(config.redis.port, 'localhost')
}

const closeRedisConnection = function (error) {
  if (error) {
    logger.error(error)
  }

  client.quit()
  console.log('Disconnecting from Redis')
}

client.on('error', closeRedisConnection)

client.on('connect', function () {
  console.log('Connected to Redis')

  const redisAuth = (config.redis.url && redisInfo) ? redisInfo.auth.split(':')[1] : config.redis.password
  if (redisAuth) {
    client.auth(redisAuth, function (error) {
      if (error) throw error
    })
  }
})

process.on('beforeExit', closeRedisConnection)

module.exports = client
