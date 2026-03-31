import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import roles from '../../data/user_roles.json' with { type: 'json' }

const validUserRoles = Object.keys(roles)

/*
a little atypical setup here...'id' is usually a unique primary key value
but in this app it is actually the username of the user
*/
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string
  declare auth0Id: CreationOptional<string>
  declare displayName: CreationOptional<string>
  declare email: CreationOptional<string>
  declare identities: CreationOptional<unknown>
  declare roles: CreationOptional<string[]>
  declare profileImageUrl: CreationOptional<string>
  declare flags: CreationOptional<unknown>
  declare data: CreationOptional<unknown>
  declare lastStreetId: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  async addRole(newRole: string) {
    if (!this.roles.includes(newRole)) {
      const updatedRoles = [...this.roles, newRole]
      this.roles = updatedRoles
      await this.update({ roles: updatedRoles })
    }
  }

  async removeRole(roleToRemove: string) {
    const newRoles = this.roles.filter((item: string) => item !== roleToRemove)
    this.roles = newRoles
    await this.update({ roles: newRoles })
  }

  static associate(_models: unknown) {
    // associations can be defined here
  }
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        unique: true,
        type: dataTypes.STRING,
      },
      auth0Id: {
        type: dataTypes.STRING,
        field: 'auth0_id',
      },
      displayName: {
        type: dataTypes.STRING,
        field: 'display_name',
        validate: {
          len: [0, 30],
        },
      },
      email: { type: dataTypes.STRING, unique: true },
      identities: dataTypes.JSON,
      roles: {
        type: dataTypes.ARRAY(dataTypes.TEXT),
        defaultValue: ['USER'],
        validate: {
          // Check if user role is a valid one against a list of defined roles
          arrayIsValid(userRoles: string[]) {
            if (!userRoles.every((value) => validUserRoles.includes(value))) {
              throw new Error('Role does not match list of valid roles')
            }
          },
        },
      },
      profileImageUrl: {
        // The maximum URL length should be "under 2000 characters"
        // https://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url-in-different-browsers
        // In practice, URLs from various login methods are under 1024
        // characters, but a rare handful of googleusercontent.com URLs are
        // just slightly longer. Bumping to 2048 characters should prevent
        // SQL insert errors that block people from signing in.
        type: dataTypes.STRING(2048),
        field: 'profile_image_url',
      },
      flags: dataTypes.JSON,
      data: dataTypes.JSON,
      lastStreetId: {
        type: dataTypes.INTEGER,
        field: 'last_street_id',
      },
      createdAt: { type: dataTypes.DATE, field: 'created_at' },
      updatedAt: { type: dataTypes.DATE, field: 'updated_at' },
    },
    {
      sequelize,
      modelName: 'User',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email'],
        },
        {
          fields: ['auth0_id'],
        },
        {
          unique: true,
          fields: ['id'],
        },
      ],
    }
  )

  return User
}
