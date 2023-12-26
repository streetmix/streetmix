'use strict'

const MAX_COMMENT_LENGTH = 280

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'Votes',
          'submitted',
          {
            type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.TEXT)
          },
          { transaction: t }
        ),
        queryInterface.addColumn(
          'Votes',
          'comment',
          {
            type: Sequelize.DataTypes.STRING(MAX_COMMENT_LENGTH)
          },
          { transaction: t }
        )
      ])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('Votes', 'submitted', { transaction: t }),
        queryInterface.removeColumn('Votes', 'comment', { transaction: t })
      ])
    })
  }
}
