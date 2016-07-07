import { API_URL } from '../app/config'

let avatarCache = {}

export function fetchAvatars () {
  // NOTE:
  // This function might be called on very old browsers. Please make
  // sure not to use modern faculties.

  if (typeof document.querySelectorAll === 'undefined') {
    return
  }

  var els = document.querySelectorAll('.avatar:not([loaded])')

  for (var i = 0, j = els.length; i < j; i++) {
    var el = els[i]
    var userId = el.getAttribute('userId') || el.getAttribute('data-user-id')

    if (userId && (typeof avatarCache[userId] === 'undefined')) {
      fetchAvatar(userId)
    }
  }

  updateAvatars()
}

function fetchAvatar (userId) {
  avatarCache[userId] = null

  window.fetch(API_URL + 'v1/users/' + userId)
    .then(function (response) {
      if (response.status !== 200) {
        throw new Error('status code ' + response.status)
      }

      return response.json()
    })
    .then(receiveAvatar)
    .catch(function (err) {
      console.error('error loading avatar for ' + userId + ':', err)
    })
}

export function receiveAvatar (details) {
  if (details && details.id && details.profileImageUrl) {
    avatarCache[details.id] = details.profileImageUrl
    updateAvatars()
  }
}

function updateAvatars () {
  var els = document.querySelectorAll('.avatar:not([loaded])')

  for (var i = 0, j = els.length; i < j; i++) {
    var el = els[i]
    var userId = el.getAttribute('userId')

    if (avatarCache[userId]) {
      el.style.backgroundImage = 'url(' + avatarCache[userId] + ')'
      el.setAttribute('loaded', true)
    }
  }
}
