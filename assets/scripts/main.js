/**
 * Streetmix
 *
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import * as Sentry from '@sentry/browser'

// Stylesheets
import '../../node_modules/leaflet/dist/leaflet.css'
import '../styles/styles.scss'

// Polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'whatwg-fetch' // fetch API
import 'handjs' // microsoft's pointer events / touch-action spec
import 'web-monetization-polyfill'
import './vendor/canvas-toBlob.js'
import './vendor/Blob.js'
import './vendor/polyfills/customevent' // customEvent in IE
import './vendor/polyfills/Element.closest'
import './vendor/polyfills/Element.remove'

// Redux
import store from './store'

// Main object
import { initialize } from './app/initialization'
import App from './app/App'

// Error tracking
// Load this before all other modules. Only load when run in production.
if (
  window.location.hostname === 'streetmix.net' ||
  window.location.hostname === 'www.streetmix.net'
) {
  Sentry.init({
    dsn: 'https://fac2c23600414d2fb78c128cdbdeaf6f@sentry.io/82756',
    whitelistUrls: [/streetmix\.net/, /www\.streetmix\.net/]
  })
}

// Accept HMR in Parcel
if (module && module.hot) {
  module.hot.accept()
}

// Mount React components
const container = document.getElementById('react-app')
const root = createRoot(container)
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)

initialize()
