const SequelizeMock = require('sequelize-mock')
const DBConnectionMock = new SequelizeMock()
const CONTAINS_KEY = 'CONTAINS_KEY'

const StreetMock = DBConnectionMock.define('street', {
  creatorId: 'user1',
  status: 'ACTIVE',
})

const VoteMock = DBConnectionMock.define('vote', {
  id: 'vote2',
  voterId: 'user2',
  streetId: 'street2',
  data: {},
})
const SequenceMock = DBConnectionMock.define('sequence')
const UserMock = DBConnectionMock.define(
  'user',
  {
    auth0Id: 'foo|123',
    name: 'Test User',
    id: 'user1',
    email: 'email@example.com',
    profileImageUrl: 'http://example.com/example.gif',
  },
  {
    instanceMethods: {
      increment: function () {
        return this
      },
    },
  }
)
const ADMIN_DEFAULTS = {
  auth0Id: 'foo|123',
  profileImageUrl: 'http://example.com/example.gif',
  email: 'email@example.com',
  id: 'admin1',
  roles: ['ADMIN'],
}

const USER_DEFAULTS = {
  auth0Id: 'foo|123',
  email: 'email@example.com',
  id: 'user1',
}

const ALT_USER_DEFAULTS = {
  ...USER_DEFAULTS,
  auth0Id: 'bar|456',
  id: 'user2',
}

const STREET_ONE = {
  id: 'street1',
  creatorId: 'user1',
}
const STREET_TWO = {
  id: 'street2',
  creatorId: 'user2',
}

const VOTE_ONE = {
  id: 'vote1',
  voterId: 'user2',
  streetId: 'street2',
}

const VOTE_TWO = {
  id: 'vote2',
  voterId: 'user1',
  streetId: 'street1',
}

VoteMock.$queryInterface.$useHandler(function (query, queryOptions, _done) {
  if (query === 'findAll') {
    return [VoteMock.build(VOTE_ONE)]
  }
  if (
    queryOptions[0] &&
    queryOptions[0].where &&
    queryOptions[0].where.id &&
    queryOptions[0].where.id === 'vote2'
  ) {
    // mocking case where vote does not belond to user
    if (queryOptions[0].where.voter_id === 'user1') {
      return null
    }

    return VoteMock.build(VOTE_TWO)
  }

  return VoteMock.build(VOTE_ONE)
})
StreetMock.$queryInterface.$useHandler(function (query, queryOptions, _done) {
  if (query === 'findAndCountAll') {
    return { rows: [StreetMock.build(STREET_ONE)], count: 1 }
  }
  if (
    queryOptions[0] &&
    queryOptions[0].where &&
    queryOptions[0].where.id &&
    queryOptions[0].where.id === 'street2'
  ) {
    return StreetMock.build(STREET_TWO)
  }

  return StreetMock.build(STREET_ONE)
})

UserMock.$queryInterface.$useHandler(function (query, queryOptions, _done) {
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
  Vote: VoteMock,
  User: UserMock,
  Sequelize: { Op: { contains: CONTAINS_KEY } },
}
