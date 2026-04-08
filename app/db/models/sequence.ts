import {
  DataTypes,
  Model,
  Sequelize,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

class Sequence extends Model<
  InferAttributes<Sequence>,
  InferCreationAttributes<Sequence>
> {
  declare id: string
  declare seq: CreationOptional<number>
}

export default (sequelize: Sequelize) => {
  Sequence.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      seq: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
    },
    {
      sequelize,
      modelName: 'Sequence',
      timestamps: false,
    }
  )

  return Sequence
}
