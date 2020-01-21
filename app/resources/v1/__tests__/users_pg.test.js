/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import users from '../users'

jest.mock('twitter')
jest.mock('../../../db/models', () => {
  var SequelizeMock = require('sequelize-mock')
  var DBConnectionMock = new SequelizeMock()
  var UserMock = DBConnectionMock.define(
    'user',
    {
      email: 'email@example.com',
      login_tokens: ['xxxxxxxx-xxxx-xxxx-xxxx-0000000000000'],
      id: 'user1'
    },
    {}
  )

  const ADMIN_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-3333333333333'
  const ADMIN_DEFAULTS = {
    email: 'email@example.com',
    login_tokens: [ADMIN_TOKEN],
    id: 'user1',
    roles: ['ADMIN']
  }

  const DEFAULT_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-1111111111111'
  const USER_DEFAULTS = {
    ...ADMIN_DEFAULTS,
    login_tokens: [DEFAULT_TOKEN],
    roles: []
  }

  UserMock.$queryInterface.$useHandler(function (query, queryOptions, done) {
    if (
      queryOptions[0] &&
      queryOptions[0].where &&
      queryOptions[0].where.login_tokens &&
      queryOptions[0].where.login_tokens[0] &&
      queryOptions[0].where.login_tokens[0] === ADMIN_TOKEN
    ) {
      return UserMock.build(ADMIN_DEFAULTS)
    } else if (
      queryOptions[0] &&
      queryOptions[0].where &&
      queryOptions[0].where.login_tokens &&
      queryOptions[0].where.login_tokens[0] &&
      queryOptions[0].where.login_tokens[0] === DEFAULT_TOKEN
    ) {
      return UserMock.build(USER_DEFAULTS)
    }

    return UserMock.build(ADMIN_DEFAULTS)
  })

  return { User: UserMock, Sequelize: { Op: jest.fn() } }
})

jest.mock('../../../../lib/logger')

// Fake user info to test the API
const emailUser = {
  auth0: {
    nickname: 'user',
    auth0_id: 'email|1111',
    email: 'test@test.com',
    profile_image_url: 'https://avatar.com/picture.png'
  }
}

describe('POST api/v1/users', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/users', users.post)
  })

  it('should respond with 200 Ok when user credentials are sent', () => {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send(JSON.stringify(emailUser))
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 400 Bad request when no user credentials are sent', () => {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send('')
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })
})

describe('GET api/v1/users', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users', users.get)
  })

  it('should respond with 200 Ok when admin user GETs Streetmix users data', () => {
    return request(app)
      .get('/api/v1/users')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 401 when user GETs Streetmix users data', () => {
    return request(app)
      .get('/api/v1/users')
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })
})
