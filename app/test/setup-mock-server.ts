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
  const jwtMock = vi.fn()

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
