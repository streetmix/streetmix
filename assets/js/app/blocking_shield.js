var BLOCKING_SHIELD_DARKEN_DELAY = 800
var BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

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

  document.querySelector('#blocking-shield .message').innerHTML = message
  document.querySelector('#blocking-shield').classList.add('visible')

  blockingShieldTimerId = window.setTimeout(function () {
    document.querySelector('#blocking-shield').classList.add('darken')
  }, BLOCKING_SHIELD_DARKEN_DELAY)

  blockingShieldTooSlowTimerId = window.setTimeout(function () {
    document.querySelector('#blocking-shield').classList.add('show-too-slow')
  }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
}

function _darkenBlockingShield (message) {
  _clearBlockingShieldTimers()
  document.querySelector('#blocking-shield').classList.add('darken-immediately')
}

function _hideBlockingShield () {
  _clearBlockingShieldTimers()
  document.querySelector('#blocking-shield').classList.remove('visible')
  document.querySelector('#blocking-shield').classList.remove('darken')
  document.querySelector('#blocking-shield').classList.remove('darken-immediately')
  document.querySelector('#blocking-shield').classList.remove('show-try-again')
  document.querySelector('#blocking-shield').classList.remove('show-too-slow')
  document.querySelector('#blocking-shield').classList.remove('show-cancel')
}
