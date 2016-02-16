/**
 * app_settings
 *
 * Change the state of the application based on combinations of
 * debug and system settings.
 *
 */
'use strict'

var debug = require('./debug_settings')
var system = require('./system_capabilities')

// Just set readOnly
var app = {
  readOnly: false
}

if (system.phone || debug.forceReadOnly) {
  app.readOnly = true
}

module.exports = app
