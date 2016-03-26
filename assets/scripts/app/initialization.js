/* global debug, system, readOnly, ENV */
// Remember, the debug & system variables are global & attached to the window
// because they are detected in a separate bundle. Require()ing them here will
// not do what you expect.
import { initLocale } from './locale'
import { scheduleNextLiveUpdateCheck } from './live_update'
import { shareMenu } from '../menus/_share'
import { feedbackMenu } from '../menus/_feedback'
import './load_resources'

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
  initLocale()
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

// Temp: use this while in transition
export function _onEverythingLoaded2 () {
  shareMenu.update()
  feedbackMenu.update()

  if (debug.forceLiveUpdate) {
    scheduleNextLiveUpdateCheck()
  }
}

window._onEverythingLoaded2 = _onEverythingLoaded2
