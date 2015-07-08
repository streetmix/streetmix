/* global MenuManager, EventTracking, Keypress */
MenuManager.define('help', {
  onInit: function () {
    Keypress.register('?', this.onClick.bind(this))
  },
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open help menu', null, null, false)
  }
})
