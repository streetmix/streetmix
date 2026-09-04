import { defineConfig } from 'cypress'

// We only need this for local testing. Cypress runner in CI does not
// load a .env, so don't throw if it's not found.
try {
  process.loadEnvFile('.env')
} catch (e) {
  if (e.code !== 'ENOENT') {
    throw e
  }
}

export default defineConfig({
  projectId: '2bmjk3',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  defaultBrowser: 'chrome',
  e2e: {
    setupNodeEvents(on, config) {
      config.env.PELIAS_HOST_NAME = process.env.PELIAS_HOST_NAME

      return config
    },
    baseUrl: 'http://localhost:8000',
  },
  expose: {
    peliasHostName: process.env.PELIAS_HOST_NAME,
  },
})
