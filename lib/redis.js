const redis = require('redis')
const config = require('config')
const url = require('url')
const logger = require('./logger.js')()

const initRedisClient = function () {
  let client, redisInfo
  if (config.redis.url) {
    redisInfo = url.parse(config.redis.url)
    client = redis.createClient(redisInfo.port, redisInfo.hostname)
  } else {
    client = redis.createClient(config.redis.port, 'localhost')
  }

  const closeRedisConnection = function (error, exitCode) {
    if (error) {
      logger.error(error)
    }

    client.quit()
    client.on('end', function () {
      console.log('Disconnected from Redis')
    })
  }

  // We do not want too many connections being made to Redis (especially for Streetmix production),
  // so before a process exits, close the connection to Redis.
  process.on('beforeExit', closeRedisConnection)
  process.on('SIGINT', closeRedisConnection)
  process.on('uncaughtException', closeRedisConnection)

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

  return client
}

module.exports = initRedisClient
