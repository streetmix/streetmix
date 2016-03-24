/**
 * dialog_shield
 *
 * Handles dialog box shield
 *
 */
import { hideAllDialogs } from './dialog'

const shieldEl = document.querySelector('#dialog-box-shield')

shieldEl.addEventListener('pointerdown', hideAllDialogs)

export function showShield () {
  shieldEl.classList.add('visible')
}

export function hideShield () {
  shieldEl.classList.remove('visible')
}
