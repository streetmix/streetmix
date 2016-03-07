'use strict'

var Menu = require('./menu')
var eventTracking = require('../app/event_tracking')

module.exports = new Menu('settings', {
  alignment: 'right',
  onShow: function () {
    eventTracking.track('Interaction', 'Open settings menu', null, null, false)
  }
})
