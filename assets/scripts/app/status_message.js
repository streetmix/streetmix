/* global _undo, _loseAnyFocus */
import { registerKeypress, deregisterKeypress } from './keypress'
const STATUS_MESSAGE_HIDE_DELAY = 15000

const el = document.querySelector('#status-message')
const msgEl = document.querySelector('#status-message > div')

let timerId = -1
let isVisible = false

export function showStatusMessage (text, undo) {
  window.clearTimeout(timerId)

  msgEl.innerHTML = text

  if (undo) {
    const buttonEl = document.createElement('button')
    buttonEl.innerHTML = 'Undo'
    buttonEl.addEventListener('pointerdown', _undo)

    msgEl.appendChild(buttonEl)
  }

  const closeEl = document.createElement('button')
  closeEl.innerHTML = '×'
  closeEl.classList.add('close')
  closeEl.addEventListener('pointerdown', _onClickTheX)

  msgEl.appendChild(closeEl)

  el.classList.add('visible')
  isVisible = true

  timerId = window.setTimeout(hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)

  // Set up keypress listener to close debug window
  registerKeypress('esc', hideStatusMessage)
}

export function hideStatusMessage () {
  if (!isVisible) {
    return
  }

  el.classList.remove('visible')
  deregisterKeypress('esc', hideStatusMessage)
}

function _onClickTheX () {
  hideStatusMessage()
  // Force window to refocus on document.body after status-message is closed by X button
  // Required on Chrome
  window.setTimeout(function () {
    _loseAnyFocus()
  }, 0)
}

// As per issue #306.
window.addEventListener('stmx:save_street', hideStatusMessage)
