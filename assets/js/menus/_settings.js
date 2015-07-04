MenuManager.define('settings', {
  alignment: 'right',
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open settings menu', null, null, false)
  }
})
