import { vi } from 'vitest'
import request from 'supertest'
import { setupMockServer } from '../../../test/setup-mock-server'
import * as streets from '../streets'

vi.mock('../../../db/models')
vi.mock('../../../lib/logger')

const street = {
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  namespacedId: 65,
  updatedAt: '2018-05-24T11:47:33.041Z',
  createdAt: '2018-05-24T11:47:32.721Z',
  data: {}
}

const mockUser = {
  sub: 'foo|123'
}

const jwtMock = vi.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.auth = jwtMock()
  next()
}

describe('POST api/v1/streets', function () {
  const app = setupMockServer((app) => {
    app.post('/api/v1/streets', mockUserMiddleware, streets.post)
  })

  it('should respond with 201 Created when street data are sent', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .post('/api/v1/streets/')
      .type('json')
      .send(JSON.stringify(street))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })
})

describe('GET api/v1/streets', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/streets', streets.find)
  })

  it('should respond with 200 Ok when streets are returned', function () {
    return request(app)
      .get('/api/v1/streets/')
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})

describe('PUT api/v1/streets/:street_id', function () {
  const app = setupMockServer((app) => {
    app.put('/api/v1/streets/:street_id', mockUserMiddleware, streets.put)
  })

  it('should respond with 204 No Content when street data are sent', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .put(`/api/v1/streets/${street.id}`)
      .type('json')
      .send(JSON.stringify(street))
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('DELETE api/v1/streets/:street_id', function () {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/streets/:street_id', mockUserMiddleware, streets.del)
  })

  it('should respond with 204 No Content when street data are deleted', function () {
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .delete(`/api/v1/streets/${street.id}`)
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/streets/:street_id', function () {
  const app = setupMockServer((app) => {
    app.get('/api/v1/streets/:street_id', streets.get)
  })

  it('should respond with 200 Ok when street is returned', function () {
    return request(app)
      .get(`/api/v1/streets/${street.id}`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
