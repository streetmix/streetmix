(function (Stmx) {

  Stmx.ui.dialogs.define('about', '#about', {
    clickSelector: '#about-streetmix',
    onShow: function () {
      var els = document.querySelectorAll('#about .avatar');
      for (var i = 0, el; el = els[i]; i++) {
        el.removeAttribute('postpone');
      }

      window.history.replaceState(null, null, URL_HELP_ABOUT);

      // Tracking
      Stmx.app.eventTracking.track(TRACK_CATEGORY_INTERACTION, 'Open about dialog box', null, null, false);

      _fetchAvatars();
    },
    onHide: function () {
      _updatePageUrl();
    }
  });

}(Stmx));
