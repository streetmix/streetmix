/**
 * Streetmix
 *
 */

import Raven from 'raven-js'
import React from 'react'
import ReactDOM from 'react-dom'

// Polyfills
import 'babel-polyfill'
import 'whatwg-fetch' // fetch API
import 'handjs' // microsoft's pointer events / touch-action spec
import './vendor/canvas-toBlob.js'
import './vendor/Blob.js'
import './vendor/modernizr-custom'
import './vendor/polyfills/customevent' // customEvent in IE

// Main object
import { initialize } from './app/initialization'
import { startListening } from './app/keypress'
import { system } from './preinit/system_capabilities'
import App from './app/App'
import DebugInfo from './app/DebugInfo'

// Error tracking
// Load this before all other modules. Only load when run in production.
if (window.location.hostname === 'streetmix.net' || window.location.hostname === 'www.streetmix.net') {
  Raven.config('https://fac2c23600414d2fb78c128cdbdeaf6f@app.getsentry.com/82756', {
    whitelistUrls: [/streetmix\.net/, /www\.streetmix\.net/]
  }).install()
}

function setScaleForPhone () {
  var meta = document.createElement('meta')
  meta.setAttribute('name', 'viewport')

  if (system.phone) {
    meta.setAttribute('content', 'initial-scale=.5, maximum-scale=.5')
  } else {
    meta.setAttribute('content', 'initial-scale=1, maximum-scale=1')
  }

  var headEls = document.getElementsByTagName('head')
  headEls[0].appendChild(meta)
}
setScaleForPhone()

// Temp: mount React components
ReactDOM.render(<App />, document.getElementById('react-app'))
ReactDOM.render(<DebugInfo />, document.getElementById('debug'))

// Start listening for keypresses
startListening()

initialize()
