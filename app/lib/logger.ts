import winston from 'winston'

// Custom formatter stringifies JavaScript object messages because
// winston@3.0.0 doesn't do this automatically with simple formatting anymore
const formatter = winston.format((info, _opts) => {
  if (typeof info.message === 'object') {
    info.message = JSON.stringify(info.message)
  }

  return info
})

const format = winston.format.combine(
  formatter(),
  winston.format.colorize(),
  winston.format.simple()
)

const createLogger = function () {
  const logger = winston.createLogger({
    transports: [],
  })

  switch (process.env.NODE_ENV) {
    case 'production':
      logger.add(
        new winston.transports.Console({
          format,
          level: 'info',
        })
      )
      break
    // Everywhere else -- dev / test environments, usually
    default:
      logger.add(
        new winston.transports.Console({
          format,
          level: 'debug',
        })
      )
      break
  }

  return logger
}

export const logger = createLogger()
