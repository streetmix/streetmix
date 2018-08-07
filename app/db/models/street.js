'use strict'
module.exports = (sequelize, DataTypes) => {
  var Street = sequelize.define('Street', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    namespaced_id: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM,
      values: [ 'ACTIVE', 'DELETED' ],
      defaultValue: 'ACTIVE'
    },
    name: DataTypes.STRING,
    creator_id: DataTypes.STRING,
    data: DataTypes.JSON,
    creator_ip: DataTypes.STRING,
    original_street_id: DataTypes.STRING
  }, {
    timestamp: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    index: [{
      fields: ['namespaced_id', 'created_at', 'updated_at']
    }]
  })
  Street.associate = function (models) {
    models.Street.belongsTo(models.User, {
      foreignKey: 'creator_id',
      targetKey: 'id'
    })

    models.Street.belongsTo(models.Street, {
      foreignKey: 'original_street_id',
      targetKey: 'id'
    })
  }
  return Street
}
