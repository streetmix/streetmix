/* global msg */
/* global _blockingCancel, _blockingTryAgain, _goReload */
// TODO: Some shield-related functionality is wound up in gallery/xhr, util/xhr

const BLOCKING_SHIELD_DARKEN_DELAY = 800
const BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

const shieldEl = document.querySelector('#blocking-shield')

let blockingShieldTimerId = -1
let blockingShieldTooSlowTimerId = -1

// Adds event listeners to the respond to buttons.
document.querySelector('#blocking-shield-cancel').addEventListener('pointerdown', _blockingCancel)
document.querySelector('#blocking-shield-try-again').addEventListener('pointerdown', _blockingTryAgain)
document.querySelector('#blocking-shield-reload').addEventListener('pointerdown', _goReload)

function clearBlockingShieldTimers () {
  window.clearTimeout(blockingShieldTimerId)
  window.clearTimeout(blockingShieldTooSlowTimerId)
}

export function showBlockingShield (message = msg('LOADING')) {
  hideBlockingShield()
  clearBlockingShieldTimers()

  shieldEl.querySelector('.message').innerHTML = message
  shieldEl.classList.add('visible')

  blockingShieldTimerId = window.setTimeout(function () {
    shieldEl.classList.add('darken')
  }, BLOCKING_SHIELD_DARKEN_DELAY)

  blockingShieldTooSlowTimerId = window.setTimeout(function () {
    shieldEl.classList.add('show-too-slow')
  }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
}

export function darkenBlockingShield (message) {
  clearBlockingShieldTimers()
  shieldEl.classList.add('darken-immediately')
}

export function hideBlockingShield () {
  clearBlockingShieldTimers()
  shieldEl.classList.remove('visible')
  shieldEl.classList.remove('darken')
  shieldEl.classList.remove('darken-immediately')
  shieldEl.classList.remove('show-try-again')
  shieldEl.classList.remove('show-too-slow')
  shieldEl.classList.remove('show-cancel')
}
