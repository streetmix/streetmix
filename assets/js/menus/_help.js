/* global MenuManager, EventTracking, Keypress */
MenuManager.define('help', {
  init: function () {
    // Run this when menu initiates
    // Register keypress handlers here
    Keypress.register('?', { shiftKey: 'optional' }, this.onClick.bind(this))
  },
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open help menu', null, null, false)
  }
})
