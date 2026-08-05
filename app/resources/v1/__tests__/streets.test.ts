import { vi } from 'vitest'
import request from 'supertest'

import {
  createMockAuthMiddleware,
  setupMockServer,
} from '../../../test/setup-mock-server.ts'
import * as streets from '../streets.ts'

const {
  streetBuildMock,
  streetFindOneMock,
  streetFindAndCountAllMock,
  userFindOneMock,
} = vi.hoisted(() => {
  const makeStreet = () => {
    const model = {
      id: 'street1',
      creatorId: 'user1',
      status: 'ACTIVE',
      name: 'Test Street',
      data: {
        street: {
          schemaVersion: 24,
          boundary: {
            left: { variant: 'narrow', floors: 2 },
            right: { variant: 'narrow', floors: 2 },
          },
          segments: [],
        },
      },
      updatedAt: '2018-05-24T11:47:33.041Z',
      clientUpdatedAt: '2018-05-24T11:47:33.041Z',
      set: vi.fn(function (this: Record<string, unknown>, payload) {
        Object.assign(this, payload)
      }),
      changed: vi.fn(),
      save: vi.fn(async function (this: Record<string, unknown>) {
        return this
      }),
    }

    return model
  }

  return {
    streetBuildMock: vi.fn(() => makeStreet()),
    streetFindOneMock: vi.fn(async () => makeStreet()),
    streetFindAndCountAllMock: vi.fn(async () => ({
      rows: [makeStreet()],
      count: 1,
    })),
    userFindOneMock: vi.fn(async () => ({
      id: 'user1',
      auth0Id: 'foo|123',
      lastStreetId: 1,
      increment: vi.fn(async function (this: Record<string, unknown>) {
        return this
      }),
      update: vi.fn(async function (this: Record<string, unknown>) {
        return this
      }),
    })),
  }
})

vi.mock('../../../db/models/index.ts', () => ({
  Sequence: {
    findByPk: vi.fn(async () => ({ seq: 1 })),
    update: vi.fn(async () => [1, [{ seq: 2 }]]),
    create: vi.fn(async () => ({ seq: 1 })),
  },
  Street: {
    build: streetBuildMock,
    findOne: streetFindOneMock,
    findAndCountAll: streetFindAndCountAllMock,
  },
  User: {
    findOne: userFindOneMock,
  },
}))

vi.mock('../../../lib/street_schema_update.js', () => ({
  updateToLatestSchemaVersion: vi.fn((streetData) => [false, streetData]),
}))

vi.mock('../../../lib/logger.ts')

const street = {
  status: 'ACTIVE',
  id: '3e888ae0-5f48-11e8-82e7-c3447c17015a',
  namespacedId: 65,
  updatedAt: '2018-05-24T11:47:33.041Z',
  createdAt: '2018-05-24T11:47:32.721Z',
  data: {
    street: {
      schemaVersion: 24,
      boundary: {
        left: { variant: 'narrow', floors: 2 },
        right: { variant: 'narrow', floors: 2 },
      },
      segments: [],
    },
  },
}

const mockUser = {
  sub: 'foo|123',
}
const { jwtMock, mockUserMiddleware } = createMockAuthMiddleware()

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
        return
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
        return
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
        return
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
        return
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
        return
      })
  })
})
