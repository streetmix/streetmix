import { Readable } from 'node:stream'
import axios from 'axios'
import { v2 as cloudinary } from 'cloudinary'
import request from 'supertest'
import { vi } from 'vitest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import {
  makeStreetFixture,
  makeUserFixture,
} from '../../../test/model-fixtures.ts'
import * as images from '../street_images.ts'

import type { Mock } from 'vitest'

vi.mock('../../../db/models/index.ts', () => ({
  Street: {
    findOne: vi.fn(async () => ({
      ...makeStreetFixture({ id: 'street1', creatorId: 'user1' }),
      dataValues: { data: { street: { segments: [] } } },
    })),
  },
  User: {
    findOne: vi.fn(async (query) => {
      const auth0Id = query?.where?.auth0Id
      if (auth0Id === 'bar|456') {
        return makeUserFixture({ id: 'user2', auth0Id })
      }

      return makeUserFixture({ id: 'user1', auth0Id: 'foo|123' })
    }),
  },
}))

vi.mock('cloudinary')
vi.mock('axios', () => ({
  default: vi.fn(),
}))

const street = makeStreetFixture({
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
})

const { jwtMock, mockUserMiddleware } = createMockAuthMiddleware()

describe('POST api/v1/streets/:street_id/image', () => {
  const app = setupMockServer((app) => {
    app.post(
      '/api/v1/streets/:street_id/image',
      mockUserMiddleware,
      images.post
    )
  })
  const details = { image: 'foo', event: 'TEST' }
  JSON.parse = vi.fn().mockReturnValue(details)

  ;(cloudinary.uploader.upload as unknown as Mock).mockResolvedValue('foo')

  it('should respond with 201 Created when a data url is sent', () => {
    ;(cloudinary.api.resource as unknown as Mock).mockResolvedValueOnce('baz')
    return request(app)
      .post(`/api/v1/streets/${street.id}/image`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
        return
      })
  })

  it('should respond with 201 Created when street thumbnail does not exist', () => {
    ;(cloudinary.api.resource as unknown as Mock).mockReturnValueOnce(null)

    return request(app)
      .post(`/api/v1/streets/${street.id}/image`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(201)
        return
      })
  })

  it('should respond with 403 Forbidden when user is not owner of street', () => {
    ;(cloudinary.api.resource as unknown as Mock).mockResolvedValueOnce('baz')

    const mockAltUser = {
      sub: 'bar|456',
    }
    jwtMock.mockReturnValueOnce(mockAltUser)

    return request(app)
      .post(`/api/v1/streets/${street.id}/image`)
      .type('text/plain')
      .send(JSON.stringify(details))
      .then((response) => {
        expect(response.statusCode).toEqual(403)
        return
      })
  })
})

describe('DELETE api/v1/streets/:street_id/image', () => {
  const app = setupMockServer((app) => {
    app.delete(
      '/api/v1/streets/:street_id/image',
      mockUserMiddleware,
      images.del
    )
  })

  ;(cloudinary.uploader.destroy as unknown as Mock).mockImplementation(
    (publicId: string, cb: (error: null, value: string) => void) =>
      cb(null, publicId)
  )

  it('should respond with 204 No content when street thumbnail is deleted by owner', () => {
    return request(app)
      .delete(`/api/v1/streets/${street.id}/image`)
      .then((response) => {
        expect(response.statusCode).toEqual(204)
        return
      })
  })
})

describe('GET api/v1/streets/:street_id/image', () => {
  const app = setupMockServer((app) => {
    app.get('/api/v1/streets/:street_id/image', images.get)
  })

  it('should respond with 200 when street thumbnail is found', () => {
    ;(cloudinary.api.resource as unknown as Mock).mockResolvedValueOnce({
      url: 'https://example.com/image.png',
    })
    ;(axios as unknown as Mock).mockResolvedValueOnce({
      data: Readable.from([]),
    })

    return request(app)
      .get(`/api/v1/streets/${street.id}/image`)
      .then((response) => {
        expect(response.statusCode).toEqual(200)
        return
      })
  })
})
