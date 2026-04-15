import {
  DataTypes,
  Model,
  type Association,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import { sequelize } from '../db.ts'
import type { Street } from './street.ts'
import type { User } from './user.ts'

const MAX_COMMENT_LENGTH = 280

export class Vote extends Model<
  InferAttributes<Vote>,
  InferCreationAttributes<Vote>
> {
  declare id: string
  declare data: CreationOptional<unknown>
  declare streetId: CreationOptional<string>
  declare voterId: CreationOptional<string>
  declare comment: CreationOptional<string>
  declare submitted: CreationOptional<string[]>
  declare score: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  declare static associations: {
    User: Association<Vote, User>
    Street: Association<Vote, Street>
  }
}

Vote.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    data: DataTypes.JSON,
    streetId: {
      type: DataTypes.STRING,
      field: 'street_id',
    },
    voterId: {
      type: DataTypes.STRING,
      field: 'voter_id',
    },
    comment: DataTypes.STRING(MAX_COMMENT_LENGTH),
    submitted: DataTypes.ARRAY(DataTypes.TEXT),
    score: DataTypes.DOUBLE,
    createdAt: { type: DataTypes.DATE, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, field: 'updated_at' },
  },
  {
    sequelize,
    modelName: 'Vote',
    timestamps: true,
    indexes: [
      {
        fields: ['created_at', 'updated_at', 'voter_id'],
      },
    ],
  }
)
