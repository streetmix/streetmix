import { vi } from 'vitest'
import request from 'supertest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import { makeUserFixture } from '../../../test/model-fixtures.ts'
import * as user from '../users.ts'

vi.mock('../../../db/models/index.ts', () => ({
  User: {
    findOne: vi.fn(async (query) => {
      const where = query?.where ?? {}

      // Returns base user fixture
      if (where.id === 'user1' || where.auth0Id === 'foo|123') {
        return makeUserFixture()
      }

      if (where.id === 'user2') {
        return makeUserFixture({ id: 'user2', auth0Id: 'bar|456' })
      }

      if (where.auth0Id === 'admin|789') {
        return makeUserFixture({
          id: 'admin1',
          auth0Id: 'admin|789',
          roles: ['ADMIN'],
        })
      }

      return null
    }),
    update: vi.fn(async () => [1, [{ id: 'user1' }]]),
  },
}))

const { jwtMock, mockUserMiddleware } = createMockAuthMiddleware()

describe('PUT api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.put('/api/v1/users/:user_id', mockUserMiddleware, user.put)
  })

  it('should respond with 204 user updates their own credentials', async () => {
    const response = await request(app)
      .put('/api/v1/users/user1')
      .type('json')
      .send(JSON.stringify({}))

    expect(response.statusCode).toEqual(204)
    return
  })

  it('should respond with 401 if a user PUTs to a different user', async () => {
    const response = await request(app)
      .put('/api/v1/users/user2')
      .type('json')
      .send(JSON.stringify({}))

    expect(response.statusCode).toEqual(401)
    return
  })

  it('should respond with 204 if an admin user PUTS to a different user', async () => {
    const mockAdminUser = {
      sub: 'admin|789',
    }
    jwtMock.mockReturnValueOnce(mockAdminUser)

    const response = await request(app)
      .put('/api/v1/users/user2')
      .type('json')
      .send(JSON.stringify({}))

    expect(response.statusCode).toEqual(204)
    return
  })
})

describe('GET api/v1/users/:user_id', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users/:user_id', mockUserMiddleware, user.get)
  })

  it('should respond with 200 when a user is found', async () => {
    const response = await request(app).get('/api/v1/users/user1')

    expect(response.statusCode).toEqual(200)
    return
  })
})

describe('DELETE api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', mockUserMiddleware, user.del)
  })

  it('should respond with 204 when user DELETEs their account', async () => {
    const response = await request(app).delete('/api/v1/users/user1')

    expect(response.statusCode).toEqual(204)
    return
  })

  it('should respond with 401 if user DELETEs a different user account', async () => {
    const response = await request(app).delete('/api/v1/users/user2')

    expect(response.statusCode).toEqual(401)
    return
  })

  it('should respond with 204 when admin user DELETEs a different user account', async () => {
    const mockAdminUser = {
      sub: 'admin|789',
    }
    jwtMock.mockReturnValueOnce(mockAdminUser)

    const response = await request(app).delete('/api/v1/users/user2')

    expect(response.statusCode).toEqual(204)
    return
  })
})
