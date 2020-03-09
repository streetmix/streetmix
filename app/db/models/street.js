'use strict'
module.exports = (sequelize, DataTypes) => {
  var Street = sequelize.define(
    'Street',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING
      },
      namespacedId: {
        type: DataTypes.INTEGER,
        field: 'namespaced_id'
      },
      status: {
        type: DataTypes.ENUM,
        values: ['ACTIVE', 'DELETED'],
        defaultValue: 'ACTIVE'
      },
      name: DataTypes.STRING,
      creatorId: {
        type: DataTypes.STRING,
        field: 'creator_id'
      },
      data: DataTypes.JSON,
      creatorIp: {
        type: DataTypes.STRING,
        field: 'creator_ip'
      },
      originalStreetId: {
        type: DataTypes.STRING,
        field: 'original_street_id'
      },
      clientUpdatedAt: {
        type: DataTypes.DATE,
        field: 'client_updated_at'
      },
      createdAt: { type: DataTypes.DATE, field: 'created_at' },
      updatedAt: { type: DataTypes.DATE, field: 'updated_at' }
    },
    {
      timestamp: true,
      index: [
        {
          fields: ['namespaced_id', 'created_at', 'updated_at']
        }
      ]
    }
  )
  Street.associate = function (models) {
    models.Street.belongsTo(models.User, {
      foreignKey: 'creatorId',
      targetKey: 'id'
    })

    models.Street.belongsTo(models.Street, {
      foreignKey: 'originalStreetId',
      targetKey: 'id'
    })
  }
  return Street
}
