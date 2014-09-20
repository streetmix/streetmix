function _onHelpMenuClick() {
  var el = document.querySelector('#help-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    el.classList.add('visible');
  } else {
    _hideMenus();
  }
}
