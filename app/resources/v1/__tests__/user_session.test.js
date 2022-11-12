/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import session from '../user_session'

jest.mock('../../../db/models')
jest.mock('../../../../lib/logger')
jest.mock('../../../lib/auth0', () => {
  return {
    Authentication: () => ({
      logout: jest.fn()
    })
  }
})

const mockUser = {
  sub: 'foo|123'
}
const jwtMock = jest.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.user = jwtMock()
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
