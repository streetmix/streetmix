/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import users from '../users'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger', () => function () {
  return {
    info: function () {},
    error: function () {},
    debug: function () {}
  }
})

// Fake user info to test the API
const user = {
  twitter: {
    screenName: 'oluwaseun',
    userId: '4232',
    oauthAccessTokenKey: '461-Hvsiosdfsoafsoafedfd',
    oauthAccessTokenSecret: 'WoZytO4kMLuafdafjdafja'
  }
}
const emailUser = {
  auth0: {
    nickname: 'omoyajowo2015',
    auth0_id: 'email|9032',
    email: 'omoyajowo2015@gmail.com',
    profile_image_url: 'https://avatar.com/picture.png'
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

  app.post('/api/v1/users', users.post)
  app.get('/api/v1/users/:user_id', users.get)
  // Set loginToken before running remaining endpoint
  app.use(setLoginToken)

  app.put('/api/v1/users/:user_id', users.put)
  app.delete('/api/v1/users/:user_id', users.delete)
  return app
}

describe('POST api/v1/users', function () {
  const app = setupMockServer()

  it('should respond with 200 Ok when user credentials are sent', function () {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send(JSON.stringify(emailUser))
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 400 Bad request when no user credentials are sent', function () {
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

  it('should respond with 204 No content when user credentails are updated', function () {
    return request(app)
      .put(`/api/v1/users/${user.twitter.screenName}`)
      .type('json')
      .send(JSON.stringify(user))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
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
})
