import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const jwtDelegate = vi.fn()

vi.mock('express-jwt', () => ({
  expressjwt: vi.fn(() => jwtDelegate),
}))

vi.mock('jwks-rsa', () => ({
  default: {
    expressJwtSecret: vi.fn(() => 'secret'),
  },
}))

const { authMiddleware } = await import('../authentication.ts')

describe('authMiddleware', () => {
  beforeEach(() => {
    jwtDelegate.mockReset()
  })

  it('responds with 401 for invalid tokens on API routes', async () => {
    jwtDelegate.mockImplementation((_req, _res, next) => {
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

  it('responds with 401 for expired tokens and logs write attempts', async () => {
    jwtDelegate.mockImplementation((_req, _res, next) => {
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
