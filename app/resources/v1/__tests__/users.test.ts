import { vi } from 'vitest'
import request from 'supertest'

import { setupMockServer } from '../../../test/setup-mock-server.ts'
import * as users from '../users.ts'

import type { Response, NextFunction } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'

vi.mock('../../../db/models.ts')
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

const jwtMock = vi.fn() // returns a user
const mockUserMiddleware = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  req.auth = jwtMock()
  next()
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
