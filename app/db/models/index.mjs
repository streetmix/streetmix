import { Sequelize, DataTypes } from 'sequelize'
import config from '../config/config.mjs'
import sequence from './sequence.mjs'
import street from './street.mjs'
import user from './user.mjs'
import userconnections from './userconnections.mjs'
import vote from './vote.mjs'

const configEnv = config[process.env.NODE_ENV]
const db = {}

let sequelize

// When we have a database connection URL string, it must
// be passed in as the first argument to the Sequelize constructor.
// Although sequelize-cli documents the `url` property as a valid
// option, Sequelize core does not use it.
if (configEnv.url) {
  sequelize = new Sequelize(configEnv.url, configEnv)
} else {
  sequelize = new Sequelize(configEnv)
}

// Set up each model
// This was ported from an older `requireindex` pattern, might
// need a refactor.
const models = {
  sequence,
  street,
  user,
  userconnections,
  vote
}

Object.values(models).forEach((modelDefiner) => {
  const model = modelDefiner(sequelize, DataTypes)

  if (!model) {
    throw new Error(`missing model for file: ${modelDefiner}`)
  }

  db[model.name] = model
})

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize

export default db
