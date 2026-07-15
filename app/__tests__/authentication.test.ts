import express from 'express'
import request from 'supertest'

const mockMiddleware = vi.fn()

vi.mock('express-jwt', () => ({
  expressjwt: vi.fn(() => mockMiddleware),
}))

vi.mock('jwks-rsa', () => ({
  default: {
    expressJwtSecret: vi.fn(() => 'secret'),
  },
}))

const { authMiddleware } = await import('../authentication.ts')

describe('authMiddleware', () => {
  beforeEach(() => {
    mockMiddleware.mockReset()
  })

  it('responds with 401 for invalid tokens on API routes', async () => {
    mockMiddleware.mockImplementation((_req, _res, next) => {
      next({ name: 'UnauthorizedError' })
    })

    const app = express()
    app.get('/api/protected', authMiddleware, (_req, res) => {
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
    mockMiddleware.mockImplementation((_req, _res, next) => {
      next({
        name: 'UnauthorizedError',
        inner: { name: 'TokenExpiredError' },
      })
    })

    const app = express()
    app.put('/api/protected', authMiddleware, (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).put('/api/protected')

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      status: 401,
      msg: 'Access token expired.',
    })
  })
})
