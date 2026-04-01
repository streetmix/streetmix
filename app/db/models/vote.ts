import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import type { Db } from './index.ts'

const MAX_COMMENT_LENGTH = 280

class Vote extends Model<InferAttributes<Vote>, InferCreationAttributes<Vote>> {
  declare id: string
  declare data: CreationOptional<unknown>
  declare streetId: CreationOptional<string>
  declare voterId: CreationOptional<string>
  declare comment: CreationOptional<string>
  declare submitted: CreationOptional<string[]>
  declare score: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static associate(models: Db) {
    models.Vote.belongsTo(models.User, {
      foreignKey: 'voterId',
      targetKey: 'id',
    })
    models.Vote.belongsTo(models.Vote, {
      foreignKey: 'streetId',
      targetKey: 'id',
    })
  }
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Vote.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: dataTypes.STRING,
      },
      data: dataTypes.JSON,
      streetId: {
        type: dataTypes.STRING,
        field: 'street_id',
      },
      voterId: {
        type: dataTypes.STRING,
        field: 'voter_id',
      },
      comment: dataTypes.STRING(MAX_COMMENT_LENGTH),
      submitted: dataTypes.ARRAY(dataTypes.TEXT),
      score: dataTypes.DOUBLE,
      createdAt: { type: dataTypes.DATE, field: 'created_at' },
      updatedAt: { type: dataTypes.DATE, field: 'updated_at' },
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

  return Vote
}
