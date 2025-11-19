'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Users',
      'display_name',
      Sequelize.DataTypes.STRING
    )
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'display_name')
  },
}
