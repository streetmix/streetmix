import { Sequence } from './sequence.ts'
import { Street } from './street.ts'
import { User } from './user.ts'
import { UserConnections } from './userconnections.ts'
import { Vote } from './vote.ts'

// Define associations
Street.belongsTo(User, {
  foreignKey: 'creatorId',
  targetKey: 'id',
})

Street.belongsTo(Street, {
  foreignKey: 'originalStreetId',
  targetKey: 'id',
})

Vote.belongsTo(User, {
  foreignKey: 'voterId',
  targetKey: 'id',
})

Vote.belongsTo(Street, {
  foreignKey: 'streetId',
  targetKey: 'id',
})

export { Sequence, Street, User, UserConnections, Vote }
