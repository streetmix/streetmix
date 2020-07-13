'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename = path.basename(__filename)
const config = require('config')
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

const queryInterface = sequelize.getQueryInterface()

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    )
  })
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file))
    if (!model) {
      throw new Error(`missing model for file: ${file}`)
    }
    db[model.name] = model
  })

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

db.sequelize = sequelize
db.queryInterface = queryInterface

db.Sequelize = Sequelize

module.exports = db
