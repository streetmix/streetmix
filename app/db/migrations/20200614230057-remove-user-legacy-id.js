'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Users', '_id')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', '_id', Sequelize.DataTypes.TEXT)
  }
}
