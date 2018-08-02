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
      if (exitCode) {
        process.exit(exitCode)
      }
    })
  }

  process.on('beforeExit', closeRedisConnection)
  process.on('uncaughtException', (error) => {
    console.log(error)
    console.trace()

    if (client.connected) {
      closeRedisConnection(error, 1)
    } else {
      process.exit(1)
    }
  })

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
