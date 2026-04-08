import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

class UserConnections extends Model<
  InferAttributes<UserConnections>,
  InferCreationAttributes<UserConnections>
> {
  declare id: CreationOptional<number>
  declare user_id: string
  declare provider: string
  declare provider_user_id: CreationOptional<string>
  declare deleted: CreationOptional<boolean>
  declare monetized: CreationOptional<boolean>
  declare metadata: CreationOptional<unknown>
}

export default (sequelize: Sequelize) => {
  UserConnections.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      provider: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      provider_user_id: DataTypes.STRING,
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      monetized: DataTypes.BOOLEAN,
      metadata: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'UserConnections',
      indexes: [
        {
          unique: true,
          fields: ['user_id', 'provider'],
        },
      ],
    }
  )

  return UserConnections
}
