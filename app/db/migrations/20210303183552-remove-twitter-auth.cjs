'use strict'

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'twitter_id', { transaction: t }),
        queryInterface.removeColumn('Users', 'twitter_credentials', {
          transaction: t,
        }),
      ])
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'Users',
          'twitter_id',
          {
            type: Sequelize.STRING,
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Users',
          'twitter_credentials',
          {
            type: Sequelize.JSON,
          },
          { transaction: t }
        ),
      ])
    })
  },
}
