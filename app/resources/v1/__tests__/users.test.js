/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import users from '../users'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger')

// Fake user info to test the API
const emailUser = {
  auth0: {
    nickname: 'user',
    auth0_id: 'email|1111',
    email: 'test@test.com',
    profile_image_url: 'https://avatar.com/picture.png'
  }
}

describe('POST api/v1/users', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/users', users.post)
  })

  it('should respond with 200 Ok when user credentials are sent', () => {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send(JSON.stringify(emailUser))
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 400 Bad request when no user credentials are sent', () => {
    return request(app)
      .post('/api/v1/users/')
      .type('json')
      .send('')
      .then((response) => {
        expect(response.statusCode).toEqual(400)
      })
  })
})

describe('GET api/v1/users', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/users', users.get)
  })

  it('should respond with 200 Ok when admin user GETs Streetmix users data', () => {
    return request(app)
      .get('/api/v1/users')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })

  it('should respond with 401 when user GETs Streetmix users data', () => {
    return request(app)
      .get('/api/v1/users')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })
})
