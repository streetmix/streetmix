Stmx.ui.dialogs.setup('about', '#about', {
  clickSelector: '#about-streetmix',
  trackCategory: TRACK_CATEGORY_INTERACTION,
  trackAction: 'Open about dialog box',
  onShow: function () {
    var els = document.querySelectorAll('#about .avatar');
    for (var i = 0, el; el = els[i]; i++) {
      el.removeAttribute('postpone');
    }

    window.history.replaceState(null, null, URL_HELP_ABOUT);

    _fetchAvatars();
  },
  onHide: function () {
    _updatePageUrl();
  }
});
