var TRACK_ACTION_ABOUT_DIALOG = 'Open about dialog box';

function _showAboutDialogBox(event) {
  if (event && (event.shiftKey || event.ctrlKey || event.metaKey)) {
    return;
  }

  _hideMenus();

  document.querySelector('#about').classList.add('visible');
  document.querySelector('#dialog-box-shield').classList.add('visible');

  var els = document.querySelectorAll('#about .avatar');
  for (var i = 0, el; el = els[i]; i++) {
    el.removeAttribute('postpone');
  }

  window.history.replaceState(null, null, URL_HELP_ABOUT);

  _fetchAvatars();

  if (event) {
    event.preventDefault();
  }

  _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_ABOUT_DIALOG, null, null, false);
}

function _hideAboutDialogBox() {
  document.querySelector('#about').classList.remove('visible');
  document.querySelector('#dialog-box-shield').classList.remove('visible');

  _updatePageUrl();
}
