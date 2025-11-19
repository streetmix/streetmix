'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'identities', Sequelize.JSON)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'identities', Sequelize.JSON)
  },
}
