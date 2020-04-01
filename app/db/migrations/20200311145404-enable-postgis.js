'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS postgis;',
      { raw: true }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query('DROP EXTENSION postgis;', {
      raw: true
    })
  }
}
