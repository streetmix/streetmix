'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'flags', Sequelize.JSON)
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('Users', 'flags')
  },
}
