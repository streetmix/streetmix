'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Streets', ['id'])
    await queryInterface.addIndex('Users', ['id'])
    await queryInterface.addIndex('Users', ['auth0_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Streets', ['id'])
    await queryInterface.removeIndex('Users', ['id'])
    await queryInterface.removeIndex('Users', ['auth0_id'])
  }
}
