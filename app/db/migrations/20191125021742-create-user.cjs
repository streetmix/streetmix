'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: Sequelize.STRING,
      },
      _id: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING,
      },
      twitter_id: {
        type: Sequelize.STRING,
      },
      twitter_credentials: {
        type: Sequelize.JSON,
      },
      auth0_id: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      roles: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      login_tokens: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      },
      profile_image_url: {
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
      last_street_id: {
        type: Sequelize.INTEGER,
      },
    })
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('Users')
  },
}
