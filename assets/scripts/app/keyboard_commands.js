'use strict'
/* global _statusMessage */

var keypress = require('./keypress')

keypress.register('ctrl s', {
  trackMsg: 'Command-S or Ctrl-S save shortcut key pressed'
}, function () {
  _statusMessage.show(msg('STATUS_NO_NEED_TO_SAVE'))
})
