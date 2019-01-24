/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import session from '../user_session'
import loginTokenParser from '../../../../lib/request_handlers/login_token_parser'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger', () => function () {
  return {
    info: function () {},
    error: function () {},
    debug: function () {}
  }
})

function setupMockServer () {
  const app = express()
  app.use(express.json())

  // Parse authorization headers if present
  app.use(loginTokenParser)

  app.delete('/api/v1/users/:user_id', session.delete)
  return app
}

describe('DELETE api/v1/users/:user_id', function () {
  const app = setupMockServer()

  it('should respond with 204 No content when user signs out', function () {
    return request(app)
      .delete('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})
