Stmx.ui.menus.define('help', {
  onShow: function () {
    Stmx.app.eventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open help menu', null, null, false)
  }
})
