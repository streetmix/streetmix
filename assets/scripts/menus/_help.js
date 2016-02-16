/* global EventTracking, TRACK_CATEGORY_INTERACTION */
'use strict'

var Menu = require('./menu')
var keypress = require('../app/keypress')

module.exports = new Menu('help', {
  init: function () {
    // Run this when menu initiates
    // Register keypress handlers here
    keypress.register('?', { shiftKey: 'optional' }, this.onClick.bind(this))
  },
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open help menu', null, null, false)
  }
})
