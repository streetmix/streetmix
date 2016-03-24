/**
 * preinit
 *
 * Tasks to setup for Streetmix ASAP.
 */

// NOTE: This a DIFFERENT bundle from the main.js bundle!
// Code will NOT be shared between bundles!

import './vendor/modernizr-custom'

// Polyfills
import 'babel-polyfill'
import 'whatwg-fetch' // fetch API
import 'handjs' // microsoft's pointer events / touch-action spec
import './polyfills/customevent' // customEvent in IE

// Cookie handling
import Cookies from 'js-cookie'

// This is placed globally while we're transitioning bundles.
// TODO: Store in application state
window.Cookies = Cookies // Momentary global export for authentication.js
window.debug = require('./preinit/debug_settings')
var system = window.system = require('./preinit/system_capabilities')
var app = window.app = require('./preinit/app_settings')
window.readOnly = app.readOnly

// Require early for scripts that ask for msg() immediately
window.msg = require('./app/messages')

setScaleForPhone()

// This event is fired by _onEverythingLoaded() in the deprecated
// global bundle. This allows things in the modular bundle to respond
// to that function without needing to be exported globally.
// This should eventually not be required & can be removed.
window.addEventListener('stmx:everything_loaded', function (e) {
  /* global _doWhatUsedToBeThe_onEverythingLoadedFunction*/
  _doWhatUsedToBeThe_onEverythingLoadedFunction()
})

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
