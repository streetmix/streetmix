import { undo as _undo } from '../streets/undo_stack'
import { registerKeypress, deregisterKeypress } from './keypress'
import { loseAnyFocus } from './focus'

const STATUS_MESSAGE_HIDE_DELAY = 15000

let timerId = -1
let isVisible = false

export function showStatusMessage (text, undo) {
  const el = document.querySelector('#status-message')
  const msgEl = el.querySelector('.status-message-content')

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

  const el = document.querySelector('#status-message')
  el.classList.remove('visible')
  deregisterKeypress('esc', hideStatusMessage)
}

function _onClickTheX () {
  hideStatusMessage()
  // Force window to refocus on document.body after status-message is closed by X button
  // Required on Chrome
  window.setTimeout(function () {
    loseAnyFocus()
  }, 0)
}

