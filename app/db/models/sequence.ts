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

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {
  Sequence.init(
    {
      id: {
        type: dataTypes.STRING,
        primaryKey: true,
      },
      seq: {
        type: dataTypes.INTEGER,
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
