var menuVisible = false;

function _hideMenus() {
  _loseAnyFocus();

  menuVisible = false;

  var els = document.querySelectorAll('.menu.visible');
  for (var i = 0, el; el = els[i]; i++) {
    el.classList.remove('visible');
  }
}
