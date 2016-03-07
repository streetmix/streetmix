'use strict'

var Menu = require('./menu')
var keypress = require('../app/keypress')
var eventTracking = require('../app/event_tracking')

module.exports = new Menu('help', {
  init: function () {
    // Run this when menu initiates
    // Register keypress handlers here
    keypress.register('?', { shiftKey: 'optional' }, this.onClick.bind(this))
  },
  onShow: function () {
    eventTracking.track('Interaction', 'Open help menu', null, null, false)
  }
})
