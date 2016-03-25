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
window.Cookies = Cookies // Momentary global export for authentication.js

// This is placed globally while we're transitioning bundles.
// TODO: Store in application state
import { debug } from './preinit/debug_settings'
window.debug = debug

import { system } from './preinit/system_capabilities'
window.system = system

import { app } from './preinit/app_settings'
// window.app = app
window.readOnly = app.readOnly

// Require early for scripts that ask for msg() immediately
import { msg } from './app/messages'
window.msg = msg

setScaleForPhone()

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

// This event is fired by _onEverythingLoaded() in the deprecated
// global bundle. This allows things in the modular bundle to respond
// to that function without needing to be exported globally.
// This should eventually not be required & can be removed.
window.addEventListener('stmx:everything_loaded', function (e) {
  /* global _onEverythingLoaded2 */
  _onEverythingLoaded2()
})
