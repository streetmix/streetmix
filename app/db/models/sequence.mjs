export default (sequelize, DataTypes) => {
  const Sequence = sequelize.define(
    'Sequence',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      seq: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      }
    },
    {
      timestamps: false
    }
  )

  Sequence.associate = function (models) {
    // associations can be defined here
  }

  return Sequence
}
