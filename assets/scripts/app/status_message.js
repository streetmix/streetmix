/* global _undo, _loseAnyFocus */
const STATUS_MESSAGE_HIDE_DELAY = 15000

const el = document.querySelector('#status-message')
const msgEl = document.querySelector('#status-message > div')

let timerId = -1

export function showStatusMessage (text, undo) {
  window.clearTimeout(timerId)

  msgEl.innerHTML = text

  if (undo) {
    var buttonEl = document.createElement('button')
    buttonEl.innerHTML = 'Undo'
    buttonEl.addEventListener('pointerdown', _undo)

    msgEl.appendChild(buttonEl)
  }

  var closeEl = document.createElement('button')
  closeEl.innerHTML = '×'
  closeEl.classList.add('close')
  closeEl.addEventListener('pointerdown', _onClickTheX)

  msgEl.appendChild(closeEl)

  el.classList.add('visible')

  timerId = window.setTimeout(hideStatusMessage, STATUS_MESSAGE_HIDE_DELAY)
}

export function hideStatusMessage () {
  el.classList.remove('visible')
}

function _onClickTheX () {
  hideStatusMessage()
  // Force window to refocus on document.body after status-message is closed by X button
  // Required on Chrome
  _loseAnyFocus()
}
