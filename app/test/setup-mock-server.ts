import express, { type Express } from 'express'

export function setupMockServer(setupFunc = (_app: Express) => {}) {
  const app = express()
  app.use(express.json())

  // Additional setup for app
  setupFunc(app)

  return app
}
