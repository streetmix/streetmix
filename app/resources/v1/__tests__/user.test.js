/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import user from '../users'

jest.mock('twitter')
jest.mock('../../../db/models', () => {
  var SequelizeMock = require('sequelize-mock')
  var DBConnectionMock = new SequelizeMock()
  var UserMock = DBConnectionMock.define(
    'user',
    {
      email: 'email@example.com',
      profile_image_url: 'http://example.com/example.gif',
      login_tokens: ['xxxxxxxx-xxxx-xxxx-xxxx-0000000000000'],
      id: 'user1'
    },
    {}
  )

  const ADMIN_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333'
  const ADMIN_DEFAULTS = {
    profile_image_url: 'http://example.com/example.gif',
    email: 'email@example.com',
    login_tokens: [ADMIN_TOKEN],
    id: 'admin1',
    roles: ['ADMIN']
  }

  const DEFAULT_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-1111111111111'
  const USER_DEFAULTS = {
    ...ADMIN_DEFAULTS,
    login_tokens: [DEFAULT_TOKEN],
    roles: []
  }
  const ALT_USER_DEFAULTS = {
    id: 'user2'
  }
  const CONTAINS_KEY = 'CONTAINS_KEY'
  UserMock.$queryInterface.$useHandler(function (query, queryOptions, done) {
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
      queryOptions[0].where.login_tokens &&
      queryOptions[0].where.login_tokens.CONTAINS_KEY &&
      queryOptions[0].where.login_tokens.CONTAINS_KEY[0] ===
        'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333'
    ) {
      return UserMock.build(ADMIN_DEFAULTS)
    }

    return UserMock.build(USER_DEFAULTS)
  })

  return { User: UserMock, Sequelize: { Op: { contains: CONTAINS_KEY } } }
})
jest.mock('../../../../lib/logger')

describe('PUT api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.put('/api/v1/users/:user_id', user.put)
  })

  it('should respond with 204 user updates their own credentials', () => {
    return request(app)
      .put('/api/v1/users/user1')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"'
      )
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it('should respond with 401 if a user PUTs to a different user', () => {
    return request(app)
      .put('/api/v1/users/user2')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-2222222222222" userId="user1"'
      )
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })

  it('should respond with 204 if an admin user PUTS to a different user', () => {
    return request(app)
      .put('/api/v1/users/user1')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"'
      )
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/users/:user_id', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users/:user_id', user.get)
  })

  it('should respond with 200 when a user is found', () => {
    return request(app)
      .get('/api/v1/users/user1')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})

describe('DELETE api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', user.delete)
  })

  it('should respond with 204 when user DELETEs their account', () => {
    return request(app)
      .delete('/api/v1/users/user1')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it('should respond with 401 if user DELETEs a different user account', () => {
    return request(app)
      .delete('/api/v1/users/user2')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-2222222222222" userId="user2"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })

  it('should respond with 204 when admin user DELETEs a different user account', () => {
    return request(app)
      .delete('/api/v1/users/user1')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})
