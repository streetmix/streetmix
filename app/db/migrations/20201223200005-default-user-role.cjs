'use strict'
const { DataTypes } = require('sequelize')
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'roles', {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: ['USER']
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'roles', {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    })
  }
}
