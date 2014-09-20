function _onIdentityMenuClick() {
  var el = document.querySelector('#identity-menu');

  _infoBubble.hide();
  _statusMessage.hide();

  if (!el.classList.contains('visible')) {
    _hideMenus();
    menuVisible = true;

    var pos = _getElAbsolutePos(document.querySelector('#identity'));
    el.style.left = pos[0] + 'px';

    el.classList.add('visible');
  } else {
    _hideMenus();
  }
}
