'use strict'

const Sequelize = require('sequelize')
const config = require('config')
const models = require('requireindex')(__dirname)
const db = {}

const configDb = config.get('db.sequelize')

let sequelize

// When we have a database connection URL string, it must
// be passed in as the first argument to the Sequelize constructor.
// Although sequelize-cli documents the `url` property as a valid
// option, Sequelize core does not use it.
if (config.has('db.sequelize.url')) {
  const url = config.get('db.sequelize.url')
  sequelize = new Sequelize(url, {
    dialect: 'postgres',
    ...configDb
  })
} else {
  sequelize = new Sequelize({
    dialect: 'postgres',
    ...configDb
  })
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

module.exports = db
