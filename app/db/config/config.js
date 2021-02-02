// This script can be loaded from the command line via
// `npx sequelize`, so we still need to load environment variables
require('dotenv').config()
const config = require('config')

// Export environment-specific Sequelize configuration
// imported from app-level configuration
// required by sequelize-cli utility
const data = {
  // Property needs to match the environment sequelize is used in
  [config.env]: {
    // Dialect needs to be explicitly supplied as of sequelize v4.0.0
    dialect: 'postgres',
    // Heroku explicitly requires ssl: true, otherwise connections may
    // fail intermittently. `dialectOptions` is not well documented by
    // the sequelize ORM, and this issue seems to be only guidance there is,
    // even for Heroku support staff:
    // https://github.com/sequelize/sequelize/issues/956#issuecomment-713296042
    dialectOptions: {
      ssl: {
        // Ref.: https://github.com/brianc/node-postgres/issues/2009
        rejectUnauthorized: false
      }
    },
    ...config.db.sequelize
  }
}

console.log(data)

module.exports = data
