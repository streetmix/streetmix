'use strict'
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    id: {
      allowNull: false,
      primaryKey: true,
      unique: true,
      type: DataTypes.STRING
    },
    twitter_id: DataTypes.STRING,
    twitter_credentials: DataTypes.JSON,
    auth0_id: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    login_tokens: DataTypes.ARRAY(DataTypes.TEXT),
    profile_image_url: DataTypes.STRING,
    data: DataTypes.JSON,
    last_street_id: DataTypes.INTEGER
  }, {
    timestamp: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      }
    ]
  })
  User.associate = function (models) {
    // associations can be defined here
  }
  return User
}
