Stmx.ui.menus.define('settings', {
  alignment: 'right',
  onShow: function () {
    Stmx.app.eventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open settings menu', null, null, false)
  }
})
