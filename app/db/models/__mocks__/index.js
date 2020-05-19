/* eslint-env jest */
const SequelizeMock = require('sequelize-mock')
const DBConnectionMock = new SequelizeMock()
const CONTAINS_KEY = 'CONTAINS_KEY'

const StreetMock = DBConnectionMock.define('street', {
  creatorId: 'user1'
})
const SequenceMock = DBConnectionMock.define('sequence')
const UserMock = DBConnectionMock.define(
  'user',
  {
    auth0Id: 'foo|123',
    name: 'Test User',
    id: 'user1',
    email: 'email@example.com',
    profileImageUrl: 'http://example.com/example.gif'
  },
  {
    instanceMethods: {
      increment: function () {
        return this
      }
    }
  }
)
const ADMIN_DEFAULTS = {
  auth0Id: 'foo|123',
  profileImageUrl: 'http://example.com/example.gif',
  email: 'email@example.com',
  id: 'admin1',
  roles: ['ADMIN']
}

const USER_DEFAULTS = {
  auth0Id: 'foo|123',
  email: 'email@example.com',
  id: 'user1'
}

const ALT_USER_DEFAULTS = {
  ...USER_DEFAULTS,
  auth0Id: 'bar|456',
  id: 'user2'
}

UserMock.$queryInterface.$useHandler(function (query, queryOptions, done) {
  if (query === 'update') return [1, [UserMock.build(USER_DEFAULTS)]]
  if (
    queryOptions[0] &&
    queryOptions[0].where &&
    queryOptions[0].where.id &&
    queryOptions[0].where.id === 'user2'
  ) {
    return UserMock.build(ALT_USER_DEFAULTS)
  } else if (
    queryOptions[0] &&
    queryOptions[0].where &&
    queryOptions[0].where.auth0_id &&
    queryOptions[0].where.auth0_id === 'bar|456'
  ) {
    return UserMock.build(ALT_USER_DEFAULTS)
  } else if (
    queryOptions[0] &&
    queryOptions[0].where &&
    queryOptions[0].where.auth0_id &&
    queryOptions[0].where.auth0_id === 'admin|789'
  ) {
    return UserMock.build(ADMIN_DEFAULTS)
  }

  return UserMock.build(USER_DEFAULTS)
})

module.exports = {
  Sequence: SequenceMock,
  Street: StreetMock,
  User: UserMock,
  Sequelize: { Op: { contains: CONTAINS_KEY } }
}
