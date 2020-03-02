'use strict'

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: DataTypes.STRING
      },
      _id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      twitterId: {
        type: DataTypes.STRING,
        field: 'twitter_id'
      },
      twitterCredentials: {
        type: DataTypes.JSON,
        field: 'twitter_credentials'
      },
      auth0Id: {
        type: DataTypes.STRING,
        field: 'auth0_id'
      },
      email: { type: DataTypes.STRING, unique: true },
      roles: DataTypes.ARRAY(DataTypes.TEXT),
      loginTokens: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: 'login_tokens'
      },
      profileImageUrl: {
        type: DataTypes.STRING,
        field: 'profile_image_url'
      },
      data: DataTypes.JSON,
      lastStreetId: {
        type: DataTypes.INTEGER,
        field: 'last_street_id'
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
    },
    {
      timestamp: true
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    }
  )

  User.associate = function (models) {
    // associations can be defined here
  }

  return User
}
