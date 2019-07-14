import express from 'express'
import loginTokenParser from '../../lib/request_handlers/login_token_parser'

export function setupMockServer (setupFunc = () => {}) {
  const app = express()
  app.use(express.json())

  // Parse authorization headers if present
  app.use(loginTokenParser)

  // Additional setup for app
  setupFunc(app)

  return app
}
