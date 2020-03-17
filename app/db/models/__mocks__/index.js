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
    name: 'Test User',
    id: 'user1',
    email: 'email@example.com',
    profileImageUrl: 'http://example.com/example.gif',
    loginTokens: ['xxxxxxxx-xxxx-xxxx-xxxx-0000000000000']
  },
  {
    instanceMethods: {
      increment: function () {
        return this
      }
    }
  }
)
const ADMIN_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333'
const ADMIN_DEFAULTS = {
  profileImageUrl: 'http://example.com/example.gif',
  email: 'email@example.com',
  loginTokens: [ADMIN_TOKEN],
  id: 'admin1',
  roles: ['ADMIN']
}

const USER_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-1111111111111'
const USER_DEFAULTS = {
  email: 'email@example.com',
  loginTokens: [USER_TOKEN],
  id: 'user1',
  roles: ['ADMIN']
}

const ALT_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-2222222222222'
const ALT_USER_DEFAULTS = {
  ...USER_DEFAULTS,
  loginTokens: [ALT_TOKEN],
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
    queryOptions[0].where.loginTokens &&
    queryOptions[0].where.loginTokens.CONTAINS_KEY &&
    queryOptions[0].where.loginTokens.CONTAINS_KEY[0] ===
      'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333'
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
