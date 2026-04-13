import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from 'sequelize'

import { sequelize } from '../db.ts'

class Sequence extends Model<
  InferAttributes<Sequence>,
  InferCreationAttributes<Sequence>
> {
  declare id: string
  declare seq: CreationOptional<number>
}

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

export default Sequence
