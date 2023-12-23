import roles from '../../data/user_roles.json' with { type: 'json' }

const validUserRoles = Object.keys(roles)

/*
a little atypical setup here...'id' is usually a unique primary key value
but in this app it is actually the username of the user
*/
export default (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: DataTypes.STRING
      },
      auth0Id: {
        type: DataTypes.STRING,
        field: 'auth0_id'
      },
      displayName: {
        type: DataTypes.STRING,
        field: 'display_name',
        validate: {
          len: [0, 30]
        }
      },
      email: { type: DataTypes.STRING, unique: true },
      identities: DataTypes.JSON,
      roles: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: ['USER'],
        validate: {
          /*
          sequelize validator passes the userRoles value which is an array of what roles they have
          for every value in the array, check if its valid against the set of valid roles
          to do this we have a custom validator
          */
          arrayIsValid (userRoles) {
            if (!userRoles.every((value) => validUserRoles.includes(value))) {
              throw new Error('Role does not match list of valid roles')
            }
          }
        }
      },
      profileImageUrl: {
        type: DataTypes.STRING(1024),
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
        },
        {
          fields: ['auth0_id']
        },
        {
          unique: true,
          fields: ['id']
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
  * check if a role _should_ be updated(added/removed) or not based on criteria(like a matching auth token from a given provider)
*/

  /*
  https://sequelize.org/master/manual/model-basics.html#taking-advantage-of-models-being-classes
  https://github.com/sequelize/sequelize/blob/4478d74a3e5dc8cd30837d8a193754867d06ccf5/docs/upgrade-to-v4.md#config--options

  code examples:
  // Class Method
  Model.associate = function (models) {
      ...associate the models
  };

  // Instance Method
  Model.prototype.someMethod = function () {..}
*/

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
