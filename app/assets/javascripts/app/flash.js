function _flash() {
  document.querySelector('#flash').classList.add('visible');

  window.setTimeout(function() {
    document.querySelector('#flash').classList.add('fading-out');
  }, 100);

  window.setTimeout(function() {
    document.querySelector('#flash').classList.remove('visible');
    document.querySelector('#flash').classList.remove('fading-out');
  }, 1000);
}
