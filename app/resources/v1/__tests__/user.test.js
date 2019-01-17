/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import user from '../user'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger', () => function () {
  return {
    info: function () {},
    error: function () {},
    debug: function () {}
  }
})

// Fake user info to test the API
const userData = {
  twitter: {
    screenName: 'oluwaseun',
    userId: '4232',
    oauthAccessTokenKey: '461-Hvsiosdfsoafsoafedfd',
    oauthAccessTokenSecret: 'WoZytO4kMLuafdafjdafja'
  }
}

function setLoginToken (req, res, next) {
  req.loginToken = '133e5110-5d2e-11e8-a8fd-678b57961690'
  req.userId = 'oluwaseun'
  next()
}

function setupMockServer () {
  const app = express()

  app.use(express.json())

  app.get('/api/v1/users/:user_id', user.get)
  // Set loginToken before running remaining endpoint
  app.use(setLoginToken)
  app.put('/api/v1/users/:user_id', user.put)
  return app
}

describe('PUT api/v1/users/:user_id', function () {
  const app = setupMockServer()

  it('should respond with 204 No content when user credentails are updated', function () {
    return request(app)
      .put(`/api/v1/users/${userData.twitter.screenName}`)
      .type('json')
      .send(JSON.stringify(userData))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it.skip('should respond with 401 if a user attempts to put a request to a user that is not them', () => {})
  it.skip('should respond with 204 if an admin user puts a request to another user', () => {})
})

describe('GET api/v1/users/:user_id', function () {
  const app = setupMockServer()

  it('should respond with 200 Ok when user is found', function () {
    return request(app)
      .get(`/api/v1/users/${userData.twitter.screenName}`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
