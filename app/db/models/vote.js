'use strict'

const MAX_COMMENT_LENGTH = 280

module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define(
    'Vote',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING
      },
      data: DataTypes.JSON,
      streetId: {
        type: DataTypes.STRING,
        field: 'street_id'
      },
      voterId: {
        type: DataTypes.STRING,
        field: 'voter_id'
      },
      comment: DataTypes.STRING(MAX_COMMENT_LENGTH),
      submitted: DataTypes.ARRAY(DataTypes.TEXT),
      score: DataTypes.DOUBLE,
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
    },
    {
      timestamp: true,
      index: [
        {
          fields: ['created_at', 'updated_at', 'voter_id']
        }
      ]
    }
  )

  Vote.associate = function (models) {
    models.Vote.belongsTo(models.User, {
      foreignKey: 'voterId',
      targetKey: 'id'
    })
    models.Vote.belongsTo(models.Vote, {
      foreignKey: 'streetId',
      targetKey: 'id'
    })
  }

  return Vote
}
