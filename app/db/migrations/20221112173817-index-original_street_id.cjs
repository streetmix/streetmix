'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Streets', ['original_street_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Streets', ['original_street_id'])
  }
}
