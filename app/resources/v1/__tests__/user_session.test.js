import { vi } from 'vitest'
import request from 'supertest'
import { setupMockServer } from '../../../test/setup-mock-server'
import session from '../user_session'

vi.mock('../../../db/models')
vi.mock('../../../lib/logger')
vi.mock('../../../lib/auth0', () => {
  return {
    Authentication: () => ({
      logout: vi.fn()
    })
  }
})

const mockUser = {
  sub: 'foo|123'
}
const jwtMock = vi.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.auth = jwtMock()
  next()
}

describe('DELETE api/v1/users/:user_id', function () {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', mockUserMiddleware, session.delete)
  })

  it('should respond with 204 No content when user signs out', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .delete('/api/v1/users/user1')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})
