const redis = require('redis')
const config = require('config')
const logger = require('./logger.js')()

const initRedisClient = function () {
  let client, redisInfo

  if (config.redis.url) {
    redisInfo = new URL(config.redis.url)
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
      logger.info('Disconnected from Redis')
    })
  }

  // We do not want too many connections being made to Redis (especially for Streetmix production),
  // so before a process exits, close the connection to Redis.
  process.on('beforeExit', closeRedisConnection)
  process.on('SIGINT', closeRedisConnection)
  process.on('uncaughtException', closeRedisConnection)

  client.on('error', closeRedisConnection)

  client.on('connect', function () {
    logger.info('Connected to Redis')

    // Use the password in the URL if provided; otherwise use the one provided by config
    const redisAuth = (config.redis.url && redisInfo) ? redisInfo.password : config.redis.password

    if (redisAuth) {
      client.auth(redisAuth, function (error) {
        if (error) throw error
      })
    }
  })

  return client
}

module.exports = initRedisClient
