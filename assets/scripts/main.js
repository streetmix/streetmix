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
import { Stmx } from './app/initialization'
import { startListening } from './app/keypress'
import { system } from './preinit/system_capabilities'
// import modules for side-effects
import './app/blocking_shield'
import './app/debug_info'
import './app/keyboard_commands'
import './app/print'
import './app/status_message'
import './app/welcome'
import './gallery/scroll'
import './gallery/view'
import './info_bubble/info_bubble'
import MenusContainer from './menus/MenusContainer'
import Palette from './app/Palette'
import './streets/name'
import './streets/scroll'
import './util/fetch_nonblocking'

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

// This event is fired by _onEverythingLoaded() in the deprecated
// global bundle. This allows things in the modular bundle to respond
// to that function without needing to be exported globally.
// This should eventually not be required & can be removed.
window.addEventListener('stmx:everything_loaded', function (e) {
  /* global _onEverythingLoaded2 */
  _onEverythingLoaded2()
})

// Temp: mount React components
ReactDOM.render(<MenusContainer />, document.getElementById('menus'))
ReactDOM.render(<Palette />, document.getElementById('palette'))

// Start listening for keypresses
startListening()

Stmx.preInit()
Stmx.init()
