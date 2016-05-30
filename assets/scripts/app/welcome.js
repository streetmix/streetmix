/* global app, system, mode, street, signedIn, settings */
/* global MODES */
import { registerKeypress, deregisterKeypress } from './keypress'
import { goNewStreet } from './routing'
import { fetchAvatars } from '../users/avatars'
import { StreetName } from '../streets/name_sign'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from '../streets/creation'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'

const welcomeEl = document.querySelector('#welcome')

let settingsWelcomeDismissed = false
let isVisible = false

function showWelcome (welcomeType = WELCOME_NONE) {
  loadSettingsWelcomeDismissed()

  if (mode === MODES.NEW_STREET) {
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

  if (welcomeType === WELCOME_NONE) {
    return
  }

  switch (welcomeType) {
    case WELCOME_FIRST_TIME_NEW_STREET:
      welcomeEl.classList.add('first-time-new-street')
      break
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      welcomeEl.classList.add('first-time-existing-street')

      document.querySelector('#welcome-new-street').addEventListener('pointerdown', function () {
        settingsWelcomeDismissed = true
        saveSettingsWelcomeDismissed()
        goNewStreet(true)
      })

      let streetName = new StreetName(document.getElementById('welcome-street-name'), street.name) // eslint-disable-line no-unused-vars

      if (street.creatorId) {
        document.querySelector('#welcome-avatar-creator').classList.add('visible')
        document.getElementById('welcome-avatar').setAttribute('userId', street.creatorId)
        document.getElementById('welcome-creator').textContent = street.creatorId
      }

      fetchAvatars()

      break
    case WELCOME_NEW_STREET:
      welcomeEl.classList.add('new-street')

      switch (settings.newStreetPreference) {
        case NEW_STREET_EMPTY:
          document.querySelector('#new-street-empty').checked = true
          break
        case NEW_STREET_DEFAULT:
          document.querySelector('#new-street-default').checked = true
          break
      }

      if (settings.priorLastStreetId && settings.priorLastStreetId !== street.id) {
        document.querySelector('#new-street-last').parentNode.classList.add('visible')
      }
      break
  }

  welcomeEl.classList.add('visible')
  document.querySelector('#street-name-canvas').classList.add('hidden')

  // Record state
  isVisible = true

  // Set up keypress listener to close welcome panel
  registerKeypress('esc', hideWelcome)
}

export function hideWelcome () {
  // Certain events will hide the welcome panel, if visible.
  // Here we check to make sure it is visible before doing anything else.
  if (isVisible === false) {
    return
  }

  settingsWelcomeDismissed = true
  saveSettingsWelcomeDismissed()

  welcomeEl.classList.remove('visible')
  document.querySelector('#street-name-canvas').classList.remove('hidden')

  // Remove keypress listener
  deregisterKeypress('esc', hideWelcome)
}

function loadSettingsWelcomeDismissed () {
  if (window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]) {
    settingsWelcomeDismissed =
      JSON.parse(window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED])
  }
}

function saveSettingsWelcomeDismissed () {
  window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] =
    JSON.stringify(settingsWelcomeDismissed)
}

// Show welcome panel on load
window.addEventListener('stmx:everything_loaded', function (e) {
  // Do not do anything in these cases
  if (app.readOnly || system.phone) {
    return
  }

  showWelcome()

  // Add the event listener for hiding it
  document.querySelector('#welcome .close').addEventListener('pointerdown', hideWelcome)
})

// Hide welcome panel on certain events
window.addEventListener('stmx:receive_gallery_street', hideWelcome)
window.addEventListener('stmx:save_street', hideWelcome)
