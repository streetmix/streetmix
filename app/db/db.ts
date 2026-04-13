import { Sequelize } from 'sequelize'

import config from './config/config.ts'

const configEnv = config[process.env.NODE_ENV || 'development']

export let sequelize: Sequelize

// If there is a `DATABASE_URL` environment variable present, that will be used
// to connect to PostgreSQL, otherwise, use the `database`, `host`, and `port`
// properties in configuration.
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, configEnv)
} else {
  sequelize = new Sequelize(configEnv)
}
