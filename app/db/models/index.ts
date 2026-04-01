import { Sequelize, DataTypes, type Model, type ModelStatic } from 'sequelize'

import config from '../config/config.js'
import Sequence from './sequence.ts'
import Street from './street.ts'
import User from './user.ts'
import UserConnections from './userconnections.ts'
import Vote from './vote.ts'

type DbModel = ModelStatic<Model> & {
  associate?: (models: Db) => void
}
export type Db = Record<string, DbModel>
type ModelDefiner = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
) => DbModel

const db: Db = {}
const configEnv = config[process.env.NODE_ENV ?? 'development']
let sequelize: Sequelize

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
  Sequence,
  Street,
  User,
  UserConnections,
  Vote,
} satisfies Record<string, ModelDefiner>

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

export default db
