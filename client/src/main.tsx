/**
 * Streetmix
 *
 */
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import * as Sentry from '@sentry/browser'

// Fonts
import '@fontsource-variable/manrope'
import '@fontsource-variable/overpass'
import '@fontsource-variable/rubik'
import '@fontsource-variable/rubik/wght-italic.css'

// Stylesheets
import 'leaflet/dist/leaflet.css'
import '~/styles/styles.css'

// Redux
import store from '~/src/store'

// Main object
import { initialize } from '~/src/app/initialization.js'
import { App } from '~/src/app/App.js'

// Error tracking
// Load this before all other modules. Only load when run in production.
if (
  window.location.hostname === 'streetmix.net' ||
  window.location.hostname === 'www.streetmix.net'
) {
  Sentry.init({
    dsn: 'https://fac2c23600414d2fb78c128cdbdeaf6f@sentry.io/82756',
    allowUrls: [/streetmix\.net/, /www\.streetmix\.net/],
  })
}

// Mount React components
const container = document.getElementById('react-app')
if (!container) throw new Error('no element to mount to')

const root = createRoot(container)
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)

initialize()
