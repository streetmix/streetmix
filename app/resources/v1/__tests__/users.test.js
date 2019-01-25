/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import users from '../users'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger')

// Fake user info to test the API
const emailUser = {
  auth0: {
    nickname: 'omoyajowo2015',
    auth0_id: 'email|9032',
    email: 'omoyajowo2015@gmail.com',
    profile_image_url: 'https://avatar.com/picture.png'
  }
}

describe('POST api/v1/users', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/users', users.post)
  })

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
