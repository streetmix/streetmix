'use strict'

var keypress = require('./keypress')
var statusMessage = require('./status_message')
var msg = require('./messages')

keypress.register('ctrl s', {
  trackMsg: 'Command-S or Ctrl-S save shortcut key pressed'
}, function () {
  statusMessage.show(msg('STATUS_NO_NEED_TO_SAVE'))
})
