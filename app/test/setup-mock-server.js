import express from 'express'

export function setupMockServer (setupFunc = () => {}) {
  const app = express()
  app.use(express.json())

  // Additional setup for app
  setupFunc(app)

  return app
}
