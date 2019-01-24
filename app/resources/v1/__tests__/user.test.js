/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import user from '../user'
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

  app.get('/api/v1/users/:user_id', user.get)
  app.put('/api/v1/users/:user_id', user.put)

  return app
}

describe('PUT api/v1/users/:user_id', () => {
  const app = setupMockServer()

  it('should respond with 204 user updates their own credentials', () => {
    return request(app)
      .put('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it('should respond with 401 if a user PUTs to a different user', () => {
    return request(app)
      .put('/api/v1/users/user2')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-2222222222222" userId="user1"')
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })

  it('should respond with 204 if an admin user PUTS to a different user', () => {
    return request(app)
      .put('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"')
      .type('json')
      .send(JSON.stringify({}))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/users/:user_id', function () {
  const app = setupMockServer()

  it('should respond with 200 when a user is found', function () {
    return request(app)
      .get('/api/v1/users/user1')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
