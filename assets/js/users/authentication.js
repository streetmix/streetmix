/* global Cookies */
var TRACK_ACTION_ERROR_15A = 'Error 15A (sign in API failure)'
var TRACK_ACTION_ERROR_RM1 = 'Error RM1 (auth 401 failure on load)'

var USER_ID_COOKIE = 'user_id'
var SIGN_IN_TOKEN_COOKIE = 'login_token'

function _goReloadClearSignIn () {
  signInData = null
  _saveSignInDataLocally()
  _removeSignInCookies()

  location.reload()
}

function _saveSignInDataLocally () {
  if (signInData) {
    window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = JSON.stringify(signInData)
  } else {
    window.localStorage[LOCAL_STORAGE_SIGN_IN_ID] = ''
  }
}

function _removeSignInCookies () {
  Cookies.remove(SIGN_IN_TOKEN_COOKIE)
  Cookies.remove(USER_ID_COOKIE)
}

function _loadSignIn () {
  signInLoaded = false

  var signInCookie = Cookies.get(SIGN_IN_TOKEN_COOKIE)
  var userIdCookie = Cookies.get(USER_ID_COOKIE)

  if (signInCookie && userIdCookie) {
    signInData = { token: signInCookie, userId: userIdCookie }

    _removeSignInCookies()
    _saveSignInDataLocally()
  } else {
    if (window.localStorage[LOCAL_STORAGE_SIGN_IN_ID]) {
      signInData = JSON.parse(window.localStorage[LOCAL_STORAGE_SIGN_IN_ID])
    }
  }

  if (signInData && signInData.token && signInData.userId) {
    _fetchSignInDetails()

    // This block was commented out because caching username causes
    // failures when the database is cleared. TODO Perhaps we should
    // be handling this more deftly.
    /*if (signInData.details) {
      signedIn = true
      _signInLoaded()
    } else {
      _fetchSignInDetails()
    }*/

  } else {
    signedIn = false
    _signInLoaded()
  }
}

function _fetchSignInDetails () {
  // TODO const
  $.ajax({
    url: API_URL + 'v1/users/' + signInData.userId,
    dataType: 'json',
    headers: { 'Authorization': _getAuthHeader() }
  }).done(_receiveSignInDetails).fail(_errorReceiveSignInDetails)
}

function _receiveSignInDetails (details) {
  signInData.details = details
  _saveSignInDataLocally()

  _receiveAvatar(details)

  signedIn = true
  _signInLoaded()
}

function _errorReceiveSignInDetails (data) {
  // If we get data.status == 0, it means that the user opened the page and
  // closed is quickly, so the request was aborted. We choose to do nothing
  // instead of clobbering sign in data below and effectively signing the
  // user out. Issue #302.

  // It also, unfortunately, might mean regular server failure, too. Marcin
  // doesn’t know what to do with it yet. Open issue #339.

  /*if (data.status == 0) {
    _showError(ERRORS.NEW_STREET_SERVER_FAILURE, true)
    return
  }*/

  if (data.status == 401) {
    EventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_RM1,
      null, null, false)

    _signOut(true)

    _showError(ERRORS.SIGN_IN_401, true)
    return
  } else if (data.status == 503) {
    EventTracking.track(TRACK_CATEGORY_ERROR, TRACK_ACTION_ERROR_15A,
      null, null, false)

    _showError(ERRORS.SIGN_IN_SERVER_FAILURE, true)
    return
  }

  // Fail silently

  signInData = null
  signedIn = false
  _signInLoaded()
}

function _onSignOutClick (event) {
  _signOut(false)

  if (event) {
    event.preventDefault()
  }
}

function _signOut (quiet) {
  settings.lastStreetId = null
  settings.lastStreetNamespacedId = null
  settings.lastStreetCreatorId = null
  _saveSettingsLocally()

  _removeSignInCookies()
  window.localStorage.removeItem(LOCAL_STORAGE_SIGN_IN_ID)
  _sendSignOutToServer(quiet)
}

function _getAuthHeader () {
  if (signInData && signInData.token) {
    return 'Streetmix realm="" loginToken="' + signInData.token + '"'
  } else {
    return ''
  }
}

function _sendSignOutToServer (quiet) {
  var call = {
    // TODO const
    url: API_URL + 'v1/users/' + signInData.userId + '/login-token',
    dataType: 'json',
    type: 'DELETE',
    headers: { 'Authorization': _getAuthHeader() }
  }

  if (quiet) {
    $.ajax(call)
  } else {
    $.ajax(call).done(_receiveSignOutConfirmationFromServer)
      .fail(_errorReceiveSignOutConfirmationFromServer)
  }
}

function _receiveSignOutConfirmationFromServer () {
  mode = MODES.SIGN_OUT
  _processMode()
}

function _errorReceiveSignOutConfirmationFromServer () {
  mode = MODES.SIGN_OUT
  _processMode()
}

function _createSignInUI () {
  if (signedIn) {
    var el = document.createElement('button')
    el.classList.add('id')
    el.classList.add('menu-attached')
    el.id = 'identity-menu-button'
    document.querySelector('#identity-menu-item').appendChild(el)

    var avatarEl = document.createElement('div')
    avatarEl.classList.add('avatar')
    avatarEl.setAttribute('userId', signInData.userId)
    document.querySelector('#identity-menu-button').appendChild(avatarEl)

    var userIdEl = document.createElement('span')
    userIdEl.classList.add('user-id')
    userIdEl.textContent = signInData.userId
    document.querySelector('#identity-menu-button').appendChild(userIdEl)

    document.querySelector('#identity-menu-item').classList.add('visible')

    _fetchAvatars()
  } else {
    var el = document.createElement('a')
    el.href = '/' + URL_SIGN_IN_REDIRECT
    el.classList.add('command')
    el.innerHTML = 'Sign in'
    document.querySelector('#sign-in-link').appendChild(el)

    document.querySelector('#identity-menu-item').classList.remove('visible')
  }
}

function _signInLoaded () {
  _loadSettings()

  _createSignInUI()

  if ((mode == MODES.CONTINUE) || (mode == MODES.JUST_SIGNED_IN) ||
    (mode == MODES.ABOUT) ||
    (mode == MODES.USER_GALLERY) || (mode == MODES.GLOBAL_GALLERY)) {
    if (settings.lastStreetId) {
      street.creatorId = settings.lastStreetCreatorId
      street.id = settings.lastStreetId
      street.namespacedId = settings.lastStreetNamespacedId

      if ((mode == MODES.JUST_SIGNED_IN) && (!street.creatorId)) {
        promoteStreet = true
      }

      if (mode == MODES.JUST_SIGNED_IN) {
        mode = MODES.CONTINUE
      }
    } else {
      mode = MODES.NEW_STREET
    }
  }

  switch (mode) {
    case MODES.EXISTING_STREET:
    case MODES.CONTINUE:
    case MODES.USER_GALLERY:
    case MODES.ABOUT:
    case MODES.GLOBAL_GALLERY:
      _fetchStreetFromServer()
      break
  }

  if (signedIn) {
    document.querySelector('#gallery-link a').href = '/' + signInData.userId
  }

  signInLoaded = true
  document.querySelector('#loading-progress').value++
  _checkIfSignInAndGeolocationLoaded()
  _checkIfEverythingIsLoaded()
}
