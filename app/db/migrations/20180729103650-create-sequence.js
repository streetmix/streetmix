'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Sequences', {
      id: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true
      },
      seq: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Sequences')
  }
}
