import express from 'express'
import request from 'supertest'

const requiredMiddleware = vi.fn()
const optionalMiddleware = vi.fn()

vi.mock('express-jwt', () => ({
  expressjwt: vi.fn((options: { credentialsRequired: boolean }) => {
    return options.credentialsRequired ? requiredMiddleware : optionalMiddleware
  }),
}))

vi.mock('jwks-rsa', () => ({
  default: {
    expressJwtSecret: vi.fn(() => 'secret'),
  },
}))

const { auth } = await import('./authentication.ts')

describe('auth', () => {
  beforeEach(() => {
    requiredMiddleware.mockReset()
    optionalMiddleware.mockReset()
  })

  it('responds with 401 for invalid tokens on API routes', async () => {
    requiredMiddleware.mockImplementation((_req, _res, next) => {
      next({ name: 'UnauthorizedError' })
    })

    const app = express()
    app.get('/api/protected', auth(), (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).get('/api/protected')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      status: 401,
      msg: 'Unauthorized request.',
    })
  })

  it('responds with 401 for expired tokens', async () => {
    requiredMiddleware.mockImplementation((_req, _res, next) => {
      next({
        name: 'UnauthorizedError',
        inner: { name: 'TokenExpiredError' },
      })
    })

    const app = express()
    app.put('/api/protected', auth(), (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).put('/api/protected')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      status: 401,
      msg: 'Access token expired.',
    })
  })

  it('allows requests without credentials when auth(false) is used', async () => {
    optionalMiddleware.mockImplementation((_req, _res, next) => {
      next()
    })

    const app = express()
    app.get('/api/optional', auth(false), (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).get('/api/optional')

    expect(response.statusCode).toBe(204)
  })
})
