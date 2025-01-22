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
        field: 'auth0_id',
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      displayName: {
        type: DataTypes.STRING,
        field: 'display_name',
        validate: {
          len: [0, 30]
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      identities: {
        type: DataTypes.JSON,
        validate: {
          isJSON: true
        }
      },
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
        // The maximum URL length should be "under 2000 characters"
        // https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
        // In practice, URLs from various login methods are under 1024
        // characters, but a rare handful of googleusercontent.com URLs are
        // just slightly longer. Bumping to 2048 characters should prevent
        // SQL insert errors that block people from signing in.
        type: DataTypes.STRING(2048),
        field: 'profile_image_url',
        validate: {
          isUrl: true,
          len: [0, 2048]
        }
      },
      flags: {
        type: DataTypes.JSON,
        validate: {
          isJSON: true
        }
      },
      data: {
        type: DataTypes.JSON,
        validate: {
          isJSON: true
        }
      },
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
