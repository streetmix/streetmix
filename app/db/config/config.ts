import path from 'node:path'
import dotenv from 'dotenv'

import { logger } from '../../lib/logger.ts'

import type { Options } from 'sequelize'

// This script can be loaded from the command line via
// `npx sequelize`, so we still need to load environment variables
dotenv.config({
  quiet: true,
  debug: process.env.DEBUG === 'true',
  path:
    process.env.NODE_ENV === 'test'
      ? path.resolve(process.cwd(), '.env.test')
      : path.resolve(process.cwd(), '.env'), // Default .env location
})

const logFunction = (msg: string) => logger.debug(`[sequelize] ${msg}`)

// Export environment-specific Sequelize configuration
// Set via environment variables
// required by sequelize-cli utility
const dbConfig: Options = {
  // Dialect needs to be explicitly supplied as of sequelize v4.0.0
  dialect: 'postgres',
  logging: process.env.DEBUG === 'true' ? logFunction : false,
  // Heroku hobby tier has max connections of 20, so this is a conservative setting
  // you'll see h22 errors if its too high:
  // https://devcenter.heroku.com/articles/error-codes#h22-connection-limit-reached
  pool: {
    max: 16,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
}

// If there is a `DATABASE_URL` environment variable present, that will be used
// to connect to PostgreSQL, otherwise, use the `database`, `host`, and `port`
// properties in configuration. These will be set using the `PG*` environment
// variables. All three must be present or a default value will be assigned.
// These values are only set if `DATABASE_URL` is undefined.
if (process.env.DATABASE_URL) {
  // @ts-expect-error This `url` property is used by sequelize-cli, but is not
  // in Sequelize core
  dbConfig.url = process.env.DATABASE_URL
} else {
  dbConfig.database = process.env.PGDATABASE || 'streetmix_dev'
  dbConfig.host = process.env.PGHOST || '127.0.0.1'
  dbConfig.port = Number(process.env.PGPORT) || 5432
}

// Fallback: set NODE_ENV when run from command line and it's not set
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'

// Heroku requires SSL connections to Postgres. As of the date of this
// commit, hobby-tier and some some older database instances do not yet
// enforce SSL, which can cause the app's database to throw the error "self
// signed certificate." So we must enable SSL but also set `rejectUnauthorized`
// to `false` to handle those app instances.
// Additional info:
// https://help.heroku.com/tickets/955239#event_5b8da58d-e65f-4f18-8744-e96c0b7507f6
if (process.env.NODE_ENV === 'production') {
  dbConfig.dialectOptions = {
    ssl: {
      rejectUnauthorized: false,
    },
  }
}

const config = {
  // Property needs to match the environment sequelize is used in
  [process.env.NODE_ENV]: dbConfig,
}

export default config
