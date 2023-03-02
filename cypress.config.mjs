import { defineConfig } from 'cypress'
import initPlugins from './cypress/plugins/index.js'

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return initPlugins(on, config)
    },
    baseUrl: 'http://localhost:8000'
  }
})
