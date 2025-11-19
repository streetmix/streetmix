'use strict'

module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('Users', 'login_tokens')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'login_tokens',
      Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT)
    )
  },
}
