MenuManager.define('help', {
  onShow: function () {
    EventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open help menu', null, null, false)
  }
})
