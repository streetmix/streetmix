/* eslint-env jest */
import request from 'supertest'
import express from 'express'
import streets from '../streets'
import loginTokenParser from '../../../../lib/request_handlers/login_token_parser'

jest.mock('../../../models/street')
jest.mock('../../../models/user')
jest.mock('../../../models/sequence')
jest.mock('../../../../lib/db', () => {})
jest.mock('../../../../lib/logger')

const street = {
  _id: '5b06a6544a62a14ae7467e37',
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  namespaced_id: 65,
  updated_at: '2018-05-24T11:47:33.041Z',
  created_at: '2018-05-24T11:47:32.721Z',
  __v: 0,
  data: { }
}

function setupMockServer () {
  const app = express()

  app.use(express.json())

  // Parse authorization headers if present
  app.use(loginTokenParser)

  app.post('/api/v1/streets', streets.post)
  app.get('/api/v1/streets', streets.find)
  app.get('/api/v1/streets/:street_id', streets.get)
  app.put('/api/v1/streets/:street_id', streets.put)
  app.delete('/api/v1/streets/:street_id', streets.delete)
  return app
}

describe('POST api/v1/streets', function () {
  const app = setupMockServer()

  it('should respond with 201 Created when street data are sent', function () {
    return request(app)
      .post('/api/v1/streets/')
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .type('json')
      .send(JSON.stringify(street))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })
})

describe('GET api/v1/streets', function () {
  const app = setupMockServer()

  it('should respond with 200 Ok when streets are returned', function () {
    return request(app)
      .get(`/api/v1/streets/`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})

describe('PUT api/v1/streets/:street_id', function () {
  const app = setupMockServer()

  it('should respond with 204 No Content when street data are sent', function () {
    return request(app)
      .put(`/api/v1/streets/${street.id}`)
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .type('json')
      .send(JSON.stringify(street))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('DELETE api/v1/streets/:street_id', function () {
  const app = setupMockServer()

  it('should respond with 204 No Content when street data are deleted', function () {
    return request(app)
      .delete(`/api/v1/streets/${street.id}`)
      .set('Authorization', 'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"')
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/streets/:street_id', function () {
  const app = setupMockServer()

  it('should respond with 200 Ok when street is returned', function () {
    return request(app)
      .get(`/api/v1/streets/${street.id}`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
