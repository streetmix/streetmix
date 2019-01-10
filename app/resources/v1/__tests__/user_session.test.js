/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import session from '../user_session'

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

function setLoginToken (req, res, next) {
  req.loginToken = '133e5110-5d2e-11e8-a8fd-678b57961690'
  req.userId = 'oluwaseun'
  next()
}

function setupMockServer () {
  const app = express()

  app.use(express.json())
  app.use(setLoginToken)
  app.delete('/api/v1/users/:user_id', session.delete)
  return app
}

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