import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import { User } from './index.ts'

import type { StreetData } from '@streetmix/types'
import type { Db } from './index.ts'

export class Street extends Model<
  InferAttributes<Street>,
  InferCreationAttributes<Street>
> {
  declare id: string
  declare namespacedId: CreationOptional<number>
  declare status: CreationOptional<'ACTIVE' | 'DELETED'>
  declare name: CreationOptional<string>
  declare creatorId: CreationOptional<string>
  declare data: CreationOptional<StreetData>
  declare creatorIp: CreationOptional<string>
  declare originalStreetId: CreationOptional<string>
  declare clientUpdatedAt: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static associate(models: Db) {
    models.Street.belongsTo(User, {
      foreignKey: 'creatorId',
      targetKey: 'id',
    })

    models.Street.belongsTo(models.Street, {
      foreignKey: 'originalStreetId',
      targetKey: 'id',
    })
  }
}

export default (sequelize: Sequelize) => {
  Street.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
      },
      namespacedId: {
        type: DataTypes.INTEGER,
        field: 'namespaced_id',
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'DELETED'),
        defaultValue: 'ACTIVE',
      },
      name: DataTypes.STRING,
      creatorId: {
        type: DataTypes.STRING,
        field: 'creator_id',
      },
      data: DataTypes.JSON,
      creatorIp: {
        type: DataTypes.STRING,
        field: 'creator_ip',
      },
      originalStreetId: {
        type: DataTypes.STRING,
        field: 'original_street_id',
      },
      clientUpdatedAt: {
        type: DataTypes.DATE,
        field: 'client_updated_at',
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
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
