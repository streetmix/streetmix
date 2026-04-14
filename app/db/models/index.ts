import { type Model, type ModelStatic } from 'sequelize'

import { sequelize } from '../db.ts'
export { Sequence } from './sequence.ts'
import Street from './street.ts'
export { User } from './user.ts'
export { UserConnections } from './userconnections.ts'
export { Vote } from './vote.ts'

type ModelAssociate = {
  associate?: (models: Db) => void
}

type DbModel<T extends Model = Model> = ModelStatic<T> & ModelAssociate

export type Db = Record<string, DbModel>

const db: Db = {}

// Set up each model
// This was ported from an older `requireindex` pattern, might
// need a refactor.
const models = {
  Street,
}

Object.entries(models).forEach(([name, modelDefiner]) => {
  const model = modelDefiner(sequelize)

  if (!model) {
    throw new Error(`missing model for file: ${name}`)
  }

  db[name] = model
})

// Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

export default db
