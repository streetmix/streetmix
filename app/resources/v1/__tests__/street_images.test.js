import { vi } from 'vitest'
import request from 'supertest'
import cloudinary from 'cloudinary'
import { setupMockServer } from '../../../test/setup-mock-server'
import images from '../street_images'

vi.mock('../../../db/models')
vi.mock('../../../lib/logger')
vi.mock('cloudinary')

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
const mockAltUser = {
  sub: 'bar|456'
}

const jwtMock = vi.fn() // returns a user
const mockUserMiddleware = (req, res, next) => {
  req.auth = jwtMock()
  next()
}

describe('POST api/v1/streets/:street_id/images', () => {
  const app = setupMockServer((app) => {
    app.post(
      '/api/v1/streets/:street_id/images',
      mockUserMiddleware,
      images.post
    )
  }, 'street_images')
  const details = { image: 'foo', event: 'TEST' }
  JSON.parse = vi.fn().mockReturnValue(details)

  cloudinary.v2.uploader.upload.mockResolvedValue('foo')

  it('should respond with 201 Created when a data url is sent', () => {
    cloudinary.v2.api.resource.mockResolvedValueOnce('baz')
    jwtMock.mockReturnValueOnce(mockUser)
    return request(app)
      .post(`/api/v1/streets/${street.id}/images`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })

  it('should respond with 201 Created when street thumbnail does not exist', () => {
    cloudinary.v2.api.resource.mockReturnValueOnce(null)

    return request(app)
      .post(`/api/v1/streets/${street.id}/images`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
      })
  })

  it('should respond with 403 Forbidden when user is not owner of street', () => {
    cloudinary.v2.api.resource.mockResolvedValueOnce('baz')

    jwtMock.mockReturnValueOnce(mockAltUser)

    return request(app)
      .post(`/api/v1/streets/${street.id}/images`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(403)
      })
  })
})

describe('DELETE api/v1/streets/:street_id/images', () => {
  const app = setupMockServer((app) => {
    app.delete(
      '/api/v1/streets/:street_id/images',
      mockUserMiddleware,
      images.delete
    )
  })

  cloudinary.v2.uploader.destroy.mockImplementation((publicId, cb) =>
    cb(null, publicId)
  )

  it('should respond with 204 No content when street thumbnail is deleted by owner', () => {
    jwtMock.mockReturnValueOnce(mockUser)

    return request(app)
      .delete(`/api/v1/streets/${street.id}/images`)
      .then((response) => {
        expect(response.statusCode).toEqual(204)
      })
  })
})

describe('GET api/v1/streets/:street_id/images', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/streets/:street_id/images', mockUserMiddleware, images.get)
  })

  cloudinary.v2.api.resource.mockResolvedValue('foo')

  it('should respond with 200 when street thumbnail is found', () => {
    return request(app)
      .get(`/api/v1/streets/${street.id}/images`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
      })
  })
})
