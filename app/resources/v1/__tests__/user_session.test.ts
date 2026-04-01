import { vi } from 'vitest'
import request from 'supertest'

import { setupMockServer } from '../../../test/setup-mock-server.ts'
import * as session from '../user_session.ts'

import type { Response, NextFunction } from 'express'
import type { Request as AuthedRequest } from 'express-jwt'

vi.mock('../../../db/models.ts')
vi.mock('../../../lib/logger.ts')
vi.mock('../../../lib/auth0.ts', () => {
  return {
    Authentication: () => ({
      logout: vi.fn(),
    }),
  }
})

const mockUser = {
  sub: 'foo|123',
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

describe('DELETE api/v1/users/:user_id', function () {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', mockUserMiddleware, session.del)
  })

  it('should respond with 204 No content when user signs out', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .delete('/api/v1/users/user1')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
        return
      })
  })
})
