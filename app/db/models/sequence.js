module.exports = (sequelize, DataTypes) => {
  var Sequence = sequelize.define('Sequence', {
    seq: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {})
  Sequence.associate = function (models) {
    // associations can be defined here
  }
  return Sequence
}
