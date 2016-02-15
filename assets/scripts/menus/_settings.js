/* global EventTracking, TRACK_CATEGORY_INTERACTION */
'use strict'

var Menu = require('./menu')

module.exports = new Menu('settings', {
  alignment: 'right',
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open settings menu', null, null, false)
  }
})
