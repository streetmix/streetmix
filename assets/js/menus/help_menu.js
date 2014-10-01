var TRACK_ACTION_HELP_MENU = 'Open help menu';

function _onHelpMenuClick() {
  var el = document.querySelector('#help-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    el.classList.add('visible');

    _eventTracking.track(TRACK_CATEGORY_INTERACTION, TRACK_ACTION_HELP_MENU, null, null, false);
  } else {
    _hideMenus();
  }
}
