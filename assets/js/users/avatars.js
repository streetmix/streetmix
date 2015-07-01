var avatarCache = {}

function _updateAvatars () {
  var els = document.querySelectorAll('.avatar:not([loaded])')

  for (var i = 0, el; el = els[i]; i++) {
    var userId = el.getAttribute('userId')

    if (avatarCache[userId]) {
      el.style.backgroundImage = 'url(' + avatarCache[userId] + ')'
      el.setAttribute('loaded', true)
    }
  }
}

function _fetchAvatars () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (typeof document.querySelectorAll == 'undefined') {
    return
  }

  var els = document.querySelectorAll('.avatar:not([loaded])')

  for (var i = 0, el; el = els[i]; i++) {
    var userId = el.getAttribute('userId')
    var postpone = el.getAttribute('postpone')

    if (userId && !postpone && (typeof avatarCache[userId] == 'undefined')) {
      _fetchAvatar(userId)
    }
  }

  _updateAvatars()
}

function _fetchAvatar (userId) {
  avatarCache[userId] = null

  $.ajax({
    dataType: 'json',
    url: API_URL + 'v1/users/' + userId
  }).done(_receiveAvatar)
}

function _receiveAvatar (details) {
  if (details && details.id && details.profileImageUrl) {
    avatarCache[details.id] = details.profileImageUrl
    _updateAvatars()
  }
}
