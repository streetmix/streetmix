import express, {
  type Express,
  type NextFunction,
  type Response,
} from 'express'
import { vi } from 'vitest'

import type { Request as AuthedRequest } from 'express-jwt'

export function setupMockServer(setupFunc = (_app: Express) => {}) {
  const app = express()
  app.use(express.json())

  // Additional setup for app
  setupFunc(app)

  return app
}

export function createMockAuthMiddleware() {
  // jwtMock returns a mock oAuth object with `sub`
  // `mockUserMiddleware` calls this to set the auth object on an authenticated
  // request, but can also be overridden to return a unique user value one time
  const jwtMock = vi.fn().mockReturnValue({
    sub: 'foo|123',
  })

  const mockUserMiddleware = (
    req: AuthedRequest,
    _res: Response,
    next: NextFunction
  ) => {
    req.auth = jwtMock()
    next()
  }

  return { jwtMock, mockUserMiddleware }
}
