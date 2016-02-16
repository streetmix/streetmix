/* global msg */
'use strict'

// TODO: Some shield-related functionality is wound up in gallery/xhr, util/xhr

var BLOCKING_SHIELD_DARKEN_DELAY = 800
var BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

var blockingShieldTimerId = -1
var blockingShieldTooSlowTimerId = -1

var shieldEl = document.querySelector('#blocking-shield')

function _clearBlockingShieldTimers () {
  window.clearTimeout(blockingShieldTimerId)
  window.clearTimeout(blockingShieldTooSlowTimerId)
}

function _showBlockingShield (message) {
  if (!message) {
    message = msg('LOADING')
  }

  _hideBlockingShield()
  _clearBlockingShieldTimers()

  shieldEl.querySelector('.message').innerHTML = message
  shieldEl.classList.add('visible')

  blockingShieldTimerId = window.setTimeout(function () {
    shieldEl.classList.add('darken')
  }, BLOCKING_SHIELD_DARKEN_DELAY)

  blockingShieldTooSlowTimerId = window.setTimeout(function () {
    shieldEl.classList.add('show-too-slow')
  }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
}

function _darkenBlockingShield (message) {
  _clearBlockingShieldTimers()
  shieldEl.classList.add('darken-immediately')
}

function _hideBlockingShield () {
  _clearBlockingShieldTimers()
  shieldEl.classList.remove('visible')
  shieldEl.classList.remove('darken')
  shieldEl.classList.remove('darken-immediately')
  shieldEl.classList.remove('show-try-again')
  shieldEl.classList.remove('show-too-slow')
  shieldEl.classList.remove('show-cancel')
}

module.exports = {
  show: _showBlockingShield,
  hide: _hideBlockingShield,
  darken: _darkenBlockingShield
}
