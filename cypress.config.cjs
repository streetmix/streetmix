const { defineConfig } = require('cypress')
const dotenv = require('dotenv')

dotenv.config()

module.exports = defineConfig({
  projectId: '2bmjk3',
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  e2e: {
    setupNodeEvents (on, config) {
      config.env.PELIAS_HOST_NAME = process.env.PELIAS_HOST_NAME

      return config
    },
    baseUrl: 'http://localhost:8000'
  }
})
