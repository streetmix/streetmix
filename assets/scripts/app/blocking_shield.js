/**
 * Blocking shield is an overlay over the screen that prevents
 * interaction. At its most basic version it is fully transparent
 * and allows other UI to take priority (e.g. gallery). At other
 * times it can be "darkened" (creating a translucent overlay)
 * showing messages or errors.
 */
import { msg } from './messages'
import { goReload } from './routing'
import { blockingCancel, blockingTryAgain } from '../util/fetch_blocking'

const BLOCKING_SHIELD_DARKEN_DELAY = 800
const BLOCKING_SHIELD_TOO_SLOW_DELAY = 10000

let blockingShieldTimerId = -1
let blockingShieldTooSlowTimerId = -1

function clearBlockingShieldTimers() {
  window.clearTimeout(blockingShieldTimerId)
  window.clearTimeout(blockingShieldTooSlowTimerId)
}

class BlockingShield
{
  constructor()
  {
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
  }

  attachListeners() {
    // Adds event listeners to the respond to buttons.
    document.querySelector('#blocking-shield-cancel').addEventListener('pointerdown', blockingCancel)
    document.querySelector('#blocking-shield-try-again').addEventListener('pointerdown', blockingTryAgain)
    document.querySelector('#blocking-shield-reload').addEventListener('pointerdown', goReload)
  }

  show(message = msg('LOADING')) {
    this.hide()
    clearBlockingShieldTimers()

    const shieldEl = document.querySelector('#blocking-shield')
    shieldEl.querySelector('.message').innerHTML = message
    shieldEl.classList.add('visible')

    blockingShieldTimerId = window.setTimeout(function () {
      shieldEl.classList.add('darken')
    }, BLOCKING_SHIELD_DARKEN_DELAY)

    blockingShieldTooSlowTimerId = window.setTimeout(function () {
      shieldEl.classList.add('show-too-slow')
    }, BLOCKING_SHIELD_TOO_SLOW_DELAY)
  }

  darken(message) {
    clearBlockingShieldTimers()
    const shieldEl = document.querySelector('#blocking-shield')
    shieldEl.classList.add('darken-immediately')
  }

  hide() {
    clearBlockingShieldTimers()
    const shieldEl = document.querySelector('#blocking-shield')
    shieldEl.classList.remove('visible')
    shieldEl.classList.remove('darken')
    shieldEl.classList.remove('darken-immediately')
    shieldEl.classList.remove('show-try-again')
    shieldEl.classList.remove('show-too-slow')
    shieldEl.classList.remove('show-cancel')
  }

}
export default new BlockingShield()

