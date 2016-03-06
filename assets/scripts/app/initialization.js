/* global debug, system, readOnly, ENV */
'use strict'

// Remember, the debug & system variables are global & attached to the window
// because they are detected in a separate bundle. Require()ing them here will
// not do what you expect.

var locale = require('./locale')

// Toggle debug features
if (debug.hoverPolygon) {
  createDebugHoverPolygon()
}

// Toggle experimental features
if (!debug.experimental) {
  document.getElementById('settings-menu-item').style.display = 'none'
} else {
  // Initalize i18n / localization
  // Currently experimental-only
  locale.init()
}

// Other
addBodyClasses()

function createDebugHoverPolygon () {
  var el = document.createElement('div')
  el.id = 'debug-hover-polygon'
  document.body.appendChild(el)

  var canvasEl = document.createElement('canvas')
  canvasEl.width = window.innerWidth
  canvasEl.height = window.innerHeight
  el.appendChild(canvasEl)
}

function addBodyClasses () {
  document.body.classList.add('environment-' + ENV)

  if (system.windows) {
    document.body.classList.add('windows')
  }

  if (system.safari) {
    document.body.classList.add('safari')
  }

  if (system.touch) {
    document.body.classList.add('touch-support')
  }

  if (readOnly) {
    document.body.classList.add('read-only')
  }

  if (system.phone) {
    document.body.classList.add('phone')
  }

  if (system.noInternet) {
    document.body.classList.add('no-internet')
  }
}

