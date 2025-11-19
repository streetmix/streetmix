'use strict'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS postgis;',
      { raw: true }
    )
  },

  down: (queryInterface) => {
    return queryInterface.sequelize.query('DROP EXTENSION postgis;', {
      raw: true,
    })
  },
}
