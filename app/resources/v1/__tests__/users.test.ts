import { vi } from 'vitest'
import request from 'supertest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import { makeUserFixture } from '../../../test/model-fixtures.ts'
import * as users from '../users.ts'

// Mocks model behavior called by user test suite.
vi.mock('../../../db/models/index.ts', () => ({
  User: {
    findOne: vi.fn(async (query) => {
      const where = query?.where ?? {}

      if (where.auth0Id === 'admin|789') {
        return makeUserFixture({
          id: 'admin1',
          auth0Id: 'admin|789',
          roles: ['ADMIN'],
        })
      }

      if (where.auth0Id) {
        return makeUserFixture({
          id: 'user1',
          auth0Id: where.auth0Id,
        })
      }

      return null
    }),
    findAll: vi.fn(async () => [makeUserFixture()]),
    create: vi.fn(async (newUserData) => makeUserFixture(newUserData)),
    update: vi.fn(async () => [1, [{ id: 'user1' }]]),
  },
}))

const { jwtMock, mockUserMiddleware } = createMockAuthMiddleware()

describe('POST api/v1/users', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/users', users.post)
  })

  // Dummy POST body
  const emailUser = {
    auth0: {
      nickname: 'user2',
      auth0Id: 'email|1111',
      email: 'test@test.com',
      profileImageUrl: 'https://avatar.com/picture.png',
    },
  }

  it('responds with 200 Ok when user credentials are sent', async () => {
    const response = await request(app)
      .post('/api/v1/users/')
      .type('json')
      .send(JSON.stringify(emailUser))

    expect(response.statusCode).toEqual(200)
    return
  })

  it('responds with 400 Bad request when no user credentials are sent', async () => {
    const response = await request(app)
      .post('/api/v1/users/')
      .type('json')
      .send('')

    expect(response.statusCode).toEqual(400)
    return
  })
})

describe('GET api/v1/users', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users', mockUserMiddleware, users.get)
  })

  it('responds with 200 Ok when admin user GETs Streetmix users data', async () => {
    const mockAdminUser = {
      sub: 'admin|789',
    }
    jwtMock.mockReturnValueOnce(mockAdminUser)

    const response = await request(app).get('/api/v1/users')

    expect(response.statusCode).toEqual(200)
    return
  })

  it('responds with 401 when user GETs Streetmix users data', async () => {
    const response = await request(app).get('/api/v1/users')

    expect(response.statusCode).toEqual(401)
    return
  })
})

describe.todo('PUT api/v1/users')
describe.todo('DEL api/v1/users')
describe.todo('PATCH api/v1/users')
