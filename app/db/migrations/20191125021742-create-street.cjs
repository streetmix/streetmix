'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Streets', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      namespaced_id: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['ACTIVE', 'DELETED'],
        defaultValue: 'ACTIVE',
      },
      name: {
        type: Sequelize.STRING,
      },
      creator_id: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.JSON,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      client_updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      creator_ip: {
        type: Sequelize.STRING,
      },
      original_street_id: {
        type: Sequelize.STRING,
      },
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Streets')
  },
}
