'use strict'

const Sequelize = require('sequelize')
const models = require('requireindex')(__dirname)
const config = require('../config/config')
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
Object.values(models).forEach((modelDefiner) => {
  const model = modelDefiner(sequelize, Sequelize.DataTypes)

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

module.exports = db
