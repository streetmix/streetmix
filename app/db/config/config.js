const config = require('config')

// Export environment-specific Sequelize configuration
// imported from app-level configuration
// required by sequelize-cli utility
module.exports = {
  // Property needs to match the environment sequelize is used in
  [config.env]: {
    // Dialect needs to be explicitly supplied as of sequelize v4.0.0
    dialect: 'postgres',
    ...config.db.sequelize
  }
}
