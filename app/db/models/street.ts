import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import type { Db } from './index.ts'

class Street extends Model<
  InferAttributes<Street>,
  InferCreationAttributes<Street>
> {
  declare id: string
  declare namespacedId: CreationOptional<number>
  declare status: CreationOptional<'ACTIVE' | 'DELETED'>
  declare name: CreationOptional<string>
  declare creatorId: CreationOptional<string>
  declare data: CreationOptional<unknown>
  declare creatorIp: CreationOptional<string>
  declare originalStreetId: CreationOptional<string>
  declare clientUpdatedAt: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static associate(models: Db) {
    models.Street.belongsTo(models.User, {
      foreignKey: 'creatorId',
      targetKey: 'id',
    })

    models.Street.belongsTo(models.Street, {
      foreignKey: 'originalStreetId',
      targetKey: 'id',
    })
  }
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Street.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: dataTypes.UUID,
      },
      namespacedId: {
        type: dataTypes.INTEGER,
        field: 'namespaced_id',
      },
      status: {
        type: dataTypes.ENUM('ACTIVE', 'DELETED'),
        defaultValue: 'ACTIVE',
      },
      name: dataTypes.STRING,
      creatorId: {
        type: dataTypes.STRING,
        field: 'creator_id',
      },
      data: dataTypes.JSON,
      creatorIp: {
        type: dataTypes.STRING,
        field: 'creator_ip',
      },
      originalStreetId: {
        type: dataTypes.STRING,
        field: 'original_street_id',
      },
      clientUpdatedAt: {
        type: dataTypes.DATE,
        field: 'client_updated_at',
      },
      createdAt: { type: dataTypes.DATE, field: 'created_at' },
      updatedAt: { type: dataTypes.DATE, field: 'updated_at' },
    },
    {
      sequelize,
      modelName: 'Street',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['namespaced_id', 'creator_id'],
        },
        {
          unique: true,
          fields: ['id'],
        },
        {
          fields: ['original_street_id'],
        },
      ],
    }
  )

  return Street
}
