import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express'
import request from 'supertest'
import { expressjwt } from 'express-jwt'

import { auth } from './authentication.ts'

import type { Mock } from 'vitest'

vi.mock('express-jwt', () => ({
  expressjwt: vi.fn(),
}))

describe('Authentication middleware', () => {
  beforeEach(() => {
    ;(expressjwt as Mock).mockReset()
  })

  it('responds with 401 for invalid tokens on API routes', async () => {
    ;(expressjwt as Mock).mockImplementation(
      () => (_req: Request, _res: Response, next: NextFunction) => {
        next({ name: 'UnauthorizedError' })
      }
    )

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
    ;(expressjwt as Mock).mockImplementation(
      () => (_req: Request, _res: Response, next: NextFunction) => {
        next({
          name: 'UnauthorizedError',
          inner: { name: 'TokenExpiredError' },
        })
      }
    )

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
    ;(expressjwt as Mock).mockImplementation(
      () => (_req: Request, _res: Response, next: NextFunction) => {
        next()
      }
    )

    const app = express()
    app.get('/api/optional', auth(false), (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).get('/api/optional')

    expect(response.statusCode).toBe(204)
  })

  it('treats invalid tokens as unauthenticated when auth(false) is used', async () => {
    ;(expressjwt as Mock).mockImplementation(
      () => (_req: Request, _res: Response, next: NextFunction) => {
        next({ name: 'UnauthorizedError' })
      }
    )

    const app = express()
    app.get('/api/optional', auth(false), (_req, res) => {
      res.status(204).end()
    })

    const response = await request(app).get('/api/optional')

    expect(response.statusCode).toBe(204)
  })
})
