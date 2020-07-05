'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'Votes',
      'submitted',
      Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT)
    )
    return queryInterface.addColumn(
      'Votes',
      'comment',
      Sequelize.DataTypes.TEXT
    )
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Votes', 'comment')
    return queryInterface.removeColumn('Votes', 'submitted')
  }
}
