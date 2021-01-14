'use strict'
/*
a little atypical setup here...'id' is usually a unique primary key value
but in this app it is actually the username of the user
*/
const userRoles = require('../../data/user_roles.json')
const roles = Object.keys(userRoles)

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
      roles: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        set (newRole) {
          if (!this.roles.includes(newRole)) {
            this.setDataValue('roles', this.roles.push(newRole))
          }
        },
        defaultValue: ['USER'],
        validate: {
          isIn: {
            args: [roles],
            msg: 'Role does not match list of valid roles'
          }
        }
      },
      profileImageUrl: {
        type: DataTypes.STRING,
        field: 'profile_image_url'
      },
      flags: DataTypes.JSON,
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

  /*
  different users of streetmix can have different roles,
  which can enable or disable certain features (see '../../data/user_roles.json')

  We need to be able to:
  * add roles

  * remove roles
  * potentially have a timestamp of when a role was last updated (?)
  * check if a role _should_ be updated(added/removed) or not based on criteria(this might need to be its own method, that gets a list of JSON objects to test against).
    this should be a function that accepts some parameters and
    searches for a match in the user's model based on a linking field.
      * if a linking attribute is found(returns a boolean), that give role can be updated (calls the 'add roles' method). returns an error if false (cant find a user) or breaks (can't perform the function for whatever else reason)
      * if it is not found, the role should be removed(calls the 'remove roles' method) or user should be flagged for a semi-manual check
        ( potentially this would be provisional, subject to manual approval?
          just in case we accidentally remove functionality from people.
          this might need a nice failsafe,
          especially early on when our supporter list is small enough)
*/

  // ok this may be actually based on out of date info about sequelize
  User.prototype.addRole = function (newRole) {
    if (!this.roles.includes(newRole)) {
      this.update(this.roles.push(newRole))
    }
  }

  User.prototype.removeRole = function (roleToRemove) {
    const newRoles = this.roles.filter((item) => item !== roleToRemove)
    this.update((this.roles = newRoles))
  }

  User.associate = function (models) {
    // associations can be defined here
  }

  return User
}
