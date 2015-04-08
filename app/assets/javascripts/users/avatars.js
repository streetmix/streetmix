var avatarCache = {};

function _updateAvatars() {
  var els = document.querySelectorAll('.avatar:not([loaded])');

  for (var i = 0, el; el = els[i]; i++) {
    var twitterId = el.getAttribute('twitterId');

    if (avatarCache[twitterId]) {
      el.style.backgroundImage = 'url(' + avatarCache[twitterId] + ')';
      el.setAttribute('loaded', true);
    }
  }
}

function _fetchAvatars() {

  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (typeof document.querySelectorAll == 'undefined') {
    return;
  }

  var els = document.querySelectorAll('.avatar:not([loaded])');

  for (var i = 0, el; el = els[i]; i++) {
    var twitterId = el.getAttribute('twitterId');
    var postpone = el.getAttribute('postpone');

    if (twitterId && !postpone && (typeof avatarCache[twitterId] == 'undefined')) {
      _fetchAvatar(twitterId);
    }
  }

  _updateAvatars();
}

function _fetchAvatar(twitterId) {
  avatarCache[twitterId] = null;

  $.ajax({
    dataType: 'json',
    url: API_URL + 'v2/users/' + twitterId
  }).done(_receiveAvatar);
}

function _receiveAvatar(details) {
  if (details && details.twitterId && details.twitterProfileImageUrl) {
    avatarCache[details.twitterId] = details.twitterProfileImageUrl;
    _updateAvatars();
  }
}
