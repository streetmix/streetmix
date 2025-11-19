'use strict'
const { DataTypes } = require('sequelize')

module.exports = {
  up: (queryInterface) => {
    return queryInterface.changeColumn('Users', 'roles', {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: ['USER'],
    })
  },

  down: (queryInterface) => {
    return queryInterface.changeColumn('Users', 'roles', {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    })
  },
}
