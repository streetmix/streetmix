/* eslint-env jest */
import request from 'supertest'
import cloudinary from 'cloudinary'
import { setupMockServer } from '../../../../test/helpers/setup-mock-server'
import images from '../street_images'

jest.mock('../../../db/models', () => {
  var SequelizeMock = require('sequelize-mock')
  var DBConnectionMock = new SequelizeMock()

  var StreetMock = DBConnectionMock.define('street', { creator_id: 'user1' })
  var SequenceMock = DBConnectionMock.define('sequence')
  var UserMock = DBConnectionMock.define(
    'user',
    {
      name: 'Test User',
      _id: 'user1',
      login_tokens: ['foo-bar'],
      id: 'user1'
    },
    {
      instanceMethods: {
        increment: function () {
          return this
        }
      }
    }
  )

  const USER_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-1111111111111'
  const USER_DEFAULTS = {
    email: 'email@example.com',
    login_tokens: [USER_TOKEN],
    id: 'user1',
    roles: ['ADMIN']
  }

  const ALT_TOKEN = 'xxxxxxxx-xxxx-xxxx-xxxx-2222222222222'
  const ALT_USER_DEFAULTS = {
    ...USER_DEFAULTS,
    login_tokens: [ALT_TOKEN],
    id: 'user2',
    _id: 'user2'
  }

  UserMock.$queryInterface.$useHandler(function (query, queryOptions, done) {
    if (
      queryOptions[0] &&
      queryOptions[0].where &&
      queryOptions[0].where.id &&
      queryOptions[0].where.id === 'user2'
    ) {
      return UserMock.build(ALT_USER_DEFAULTS)
    }

    return UserMock.build(USER_DEFAULTS)
  })

  return {
    Sequence: SequenceMock,
    Street: StreetMock,
    User: UserMock,
    Sequelize: { Op: jest.fn() }
  }
})
jest.mock('../../../../lib/logger')
jest.mock('cloudinary')

const street = {
  _id: '5b06a6544a62a14ae7467e37',
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  namespaced_id: 65,
  updated_at: '2018-05-24T11:47:33.041Z',
  created_at: '2018-05-24T11:47:32.721Z',
  __v: 0,
  data: {}
}

describe('POST api/v1/streets/images/:street_id', () => {
  const app = setupMockServer((app) => {
    app.post('/api/v1/streets/images/:street_id', images.post)
  })

  const details = { image: 'foo', event: 'TEST' }
  JSON.parse = jest.fn().mockReturnValue(details)

  cloudinary.v2.uploader.upload.mockResolvedValue('foo')

  it('should respond with 201 Created when a data url is sent', () => {
    cloudinary.v2.api.resource.mockResolvedValueOnce('baz')

    return request(app)
      .post(`/api/v1/streets/images/${street.id}`)
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"'
      )
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })

  it('should respond with 201 Created when street thumbnail does not exist', () => {
    cloudinary.v2.api.resource.mockReturnValueOnce(null)

    return request(app)
      .post(`/api/v1/streets/images/${street.id}`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })

  it('should respond with 403 Forbidden when user is not owner of street', () => {
    cloudinary.v2.api.resource.mockResolvedValueOnce('baz')

    return request(app)
      .post(`/api/v1/streets/images/${street.id}`)
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-2222222222222" userId="user2"'
      )
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(403)
      })
  })
})

describe('DELETE api/v1/streets/images/:street_id', () => {
  const app = setupMockServer((app) => {
    app.delete('/api/v1/streets/images/:street_id', images.delete)
  })

  cloudinary.v2.uploader.destroy.mockImplementation((publicId, cb) =>
    cb(null, publicId)
  )

  it('should respond with 204 No content when street thumbnail is deleted by owner', () => {
    return request(app)
      .delete(`/api/v1/streets/images/${street.id}`)
      .set(
        'Authorization',
        'Streetmix realm="" loginToken="xxxxxxxx-xxxx-xxxx-xxxx-1111111111111" userId="user1"'
      )
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/streets/images/:street_id', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/streets/images/:street_id', images.get)
  })

  cloudinary.v2.api.resource.mockResolvedValue('foo')

  it('should respond with 200 when street thumbnail is found', () => {
    return request(app)
      .get(`/api/v1/streets/images/${street.id}`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
