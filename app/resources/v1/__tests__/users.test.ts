import { vi } from 'vitest'
import request from 'supertest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import { makeUserFixture } from '../../../test/model-fixtures.ts'
import * as users from '../users.ts'

const { userFindOneMock, userFindAllMock, userCreateMock, userUpdateMock } =
  vi.hoisted(() => ({
    userFindOneMock: vi.fn(async (query) => {
      const where = query?.where ?? {}

      if (where.auth0Id === 'admin|789') {
        return makeUserFixture({
          id: 'admin1',
          auth0Id: 'admin|789',
          roles: ['ADMIN'],
        })
      }

      if (where.auth0Id === 'foo|123') {
        return makeUserFixture({ id: 'user1', auth0Id: 'foo|123' })
      }

      if (where.auth0Id) {
        return makeUserFixture({
          id: 'user2',
          auth0Id: where.auth0Id,
        })
      }

      if (where.id) {
        return makeUserFixture({ id: where.id, auth0Id: 'foo|123' })
      }

      return null
    }),
    userFindAllMock: vi.fn(async () => [
      makeUserFixture({ profileImageUrl: 'https://avatar.com/u1.png' }),
    ]),
    userCreateMock: vi.fn(async (newUserData) => makeUserFixture(newUserData)),
    userUpdateMock: vi.fn(async () => [1, [{ id: 'user1' }]]),
  }))

vi.mock('../../../db/models/index.ts', () => ({
  User: {
    findOne: userFindOneMock,
    findAll: userFindAllMock,
    create: userCreateMock,
    update: userUpdateMock,
  },
}))

vi.mock('../../../lib/logger.ts')

// Fake user info to test the API
const emailUser = {
  auth0: {
    nickname: 'user2',
    auth0Id: 'email|1111',
    email: 'test@test.com',
    profileImageUrl: 'https://avatar.com/picture.png',
  },
}

const mockUser = {
  sub: 'foo|123',
}

const mockAdminUser = {
  sub: 'admin|789',
}
const { jwtMock, mockUserMiddleware } = createMockAuthMiddleware()

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
        return
      })
  })

  it('should respond with 400 Bad request when no user credentials are sent', () => {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send('')
      .then((response) => {
        expect(response.statusCode).toEqual(400)
        return
      })
  })
})

describe('GET api/v1/users', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users', mockUserMiddleware, users.get)
  })

  it('should respond with 200 Ok when admin user GETs Streetmix users data', () => {
    jwtMock.mockReturnValueOnce(mockAdminUser)
    return request(app)
      .get('/api/v1/users')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        return
      })
  })

  it('should respond with 401 when user GETs Streetmix users data', () => {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .get('/api/v1/users')
      .then((response) => {
        expect(response.statusCode).toEqual(401)
        return
      })
  })
})
