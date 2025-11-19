import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class UserConnections extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }

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
