var WELCOME_NONE = 0
var WELCOME_NEW_STREET = 1
var WELCOME_FIRST_TIME_NEW_STREET = 2
var WELCOME_FIRST_TIME_EXISTING_STREET = 3

function _showWelcome () {
  if (readOnly || system.phone) {
    return
  }

  var welcomeType = WELCOME_NONE

  _loadSettingsWelcomeDismissed()

  if (mode == MODES.NEW_STREET) {
    if (signedIn || settingsWelcomeDismissed) {
      welcomeType = WELCOME_NEW_STREET
    } else {
      welcomeType = WELCOME_FIRST_TIME_NEW_STREET
    }
  } else {
    if (!settingsWelcomeDismissed) {
      welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET
    }
  }

  if (welcomeType == WELCOME_NONE) {
    return
  }

  switch (welcomeType) {
    case WELCOME_FIRST_TIME_NEW_STREET:
      document.querySelector('#welcome').classList.add('first-time-new-street')
      break
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      document.querySelector('#welcome').classList.add('first-time-existing-street')

      document.querySelector('#welcome-new-street').addEventListener('pointerdown', function () {
        settingsWelcomeDismissed = true
        _saveSettingsWelcomeDismissed()
        _goNewStreet(true)
      })

      var streetName = new StreetName(document.getElementById('welcome-street-name'), street.name)

      if (street.creatorId) {
        document.querySelector('#welcome-avatar-creator').classList.add('visible')
        $('#welcome-avatar').attr('userId', street.creatorId)
        $('#welcome-creator').text(street.creatorId)
      }
      _fetchAvatars()
      break
    case WELCOME_NEW_STREET:
      document.querySelector('#welcome').classList.add('new-street')

      switch (settings.newStreetPreference) {
        case NEW_STREET_EMPTY:
          document.querySelector('#new-street-empty').checked = true
          break
        case NEW_STREET_DEFAULT:
          document.querySelector('#new-street-default').checked = true
          break
      }

      if (settings.priorLastStreetId && settings.priorLastStreetId != street.id) {
        document.querySelector('#new-street-last').parentNode.classList.add('visible')
      }
      break
  }

  document.querySelector('#welcome').classList.add('visible')
  document.querySelector('#street-name-canvas').classList.add('hidden')
}

function _hideWelcome () {
  settingsWelcomeDismissed = true
  _saveSettingsWelcomeDismissed()

  document.querySelector('#welcome').classList.remove('visible')
  document.querySelector('#street-name-canvas').classList.remove('hidden')
}
