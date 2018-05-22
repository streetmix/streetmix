/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import requestHandlers from '../../../../lib/request_handlers'
// import mockingoose from 'mockingoose'
import users from '../users'
import user from '../../../models/user'

jest.mock('../../../../lib/logger', () => function () {
  return {
    info: function () {},
    error: function () {}
  }
})

// Fake user info to test the API
// const user = {
//   twitter: {
//     screenName: 'oluwaseun',
//     userId: '4232',
//     oauthAccessTokenKey: '461-Hvsiosdfsoafsoafedfd',
//     oauthAccessTokenSecret: 'WoZytO4kMLuafdafjdafja'
//   }
// }

function setupMockServer () {
  const app = express()

  app.use(express.json())
  app.use(requestHandlers.login_token_parser)
  app.use(requestHandlers.request_log)
  app.use(requestHandlers.request_id_echo)

  app.post('/api/v1/users', users.post)
  app.put('/api/v1/users/:user_id', users.put)
  app.get('/api/v1/users/:user_id', users.get)
  app.delete('/api/v1/users/:user_id', users.delete)
  return app
}

describe('POST api/v1/users', function () {
  const app = setupMockServer()
  it('should respond with 201 created when user credentials are sent', function () {
    // Post to users with new user credentials
    return request(app)
      .post('/api/v1/users')
      .type('json')
      .send(JSON.stringify(user))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })

  it('should respond with 200 Ok when user credentials are sent', function () {
    // Post to users with existing credentials
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send(JSON.stringify(user))
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 400 Bad request when user credentials are sent', function () {
    // Post to users with invalid credentails
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send('')
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })
})

describe('PUT api/v1/users/:user_id', function () {
  const app = setupMockServer()
  it('should respond with 401 Unauthorized when user loginToken does not match', function () {
    return request(app)
      .put(`/api/v1/users/${user.twitter.screenName}`)
      .type('json')
      .send(JSON.stringify(user))
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })

  it('should respond with 404 Not found when user is not found', function () {
    return request(app)
      .put(`/api/v1/users/flickz`)
      .type('json')
      .send(JSON.stringify(user))
      .then((response) => {
        expect(response.statusCode).toEqual(404)
      })
  })
})

describe('GET api/v1/users/:user_id', function () {
  const app = setupMockServer()
  it('should respond with 200 Ok when user is found', function () {
    return request(app)
      .get(`/api/v1/users/${user.twitter.screenName}`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 404 Ok when user is not found', function () {
    return request(app)
      .get(`/api/v1/users/flickz`)
      .then((response) => {
        expect(response.statusCode).toEqual(404)
      })
  })
})

describe('DELETE api/v1/users/:user_id', function () {
  const app = setupMockServer()
  it('should respond with 204 No content when user signs out', function () {
    return request(app)
      .delete(`/api/v1/users/${user.twitter.screenName}`)
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
  it('should respond with 404 Not found when user is not found', function () {
    return request(app)
      .delete(`/api/v1/users/flickz`)
      .then((response) => {
        expect(response.statusCode).toEqual(404)
      })
  })
})
