/* global _undo, _loseAnyFocus */
'use strict'

var msg = require('./messages')

var STATUS_MESSAGE_HIDE_DELAY = 15000

var timerId = -1

module.exports = {
  show: function (text, undo) {
    window.clearTimeout(timerId)

    document.querySelector('#status-message > div').innerHTML = text

    if (undo) {
      var buttonEl = document.createElement('button')
      buttonEl.innerHTML = 'Undo'
      buttonEl.addEventListener('pointerdown', _undo)
      document.querySelector('#status-message > div').appendChild(buttonEl)
    }

    var el = document.createElement('button')
    el.classList.add('close')
    el.addEventListener('pointerdown', _onClickTheX.bind(this))
    el.innerHTML = msg('UI_GLYPH_X')
    document.querySelector('#status-message > div').appendChild(el)

    document.querySelector('#status-message').classList.add('visible')

    timerId = window.setTimeout(this.hide, STATUS_MESSAGE_HIDE_DELAY)

    function _onClickTheX () {
      this.hide()
      // Force window to refocus on document.body after status-message is closed by X button
      // Required on Chrome
      _loseAnyFocus()
    }
  },

  hide: function () {
    document.querySelector('#status-message').classList.remove('visible')
  }
}
