/* eslint-env jest */
import request from 'supertest'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import user from '../user'

jest.mock('../../../models/user')
jest.mock('../../../../lib/logger')

describe('PUT api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.put('/api/v1/users/:user_id', user.put)
  })

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
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
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
  const app = setupMockServer((app) => {
    app.get('/api/v1/users/:user_id', user.get)
  })

  it('should respond with 200 when a user is found', () => {
    return request(app)
      .get('/api/v1/users/user1')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})

describe('DELETE api/v1/users/:user_id', () => {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/users/:user_id', user.delete)
  })

  it('should respond with 204 when user DELETEs their account', () => {
    return request(app)
      .delete('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })

  it('should respond with 401 if user DELETEs a different user account', () => {
    return request(app)
      .delete('/api/v1/users/user2')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(401)
      })
  })

  it('should respond with 204 when admin user DELETEs a different user account', () => {
    return request(app)
      .delete('/api/v1/users/user1')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-3333333333333" userId="admin"')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})
