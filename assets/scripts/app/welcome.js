import { app } from '../preinit/app_settings'
import { system } from '../preinit/system_capabilities'
import { NEW_STREET_DEFAULT, NEW_STREET_EMPTY } from '../streets/creation'
import { getStreet } from '../streets/data_model'
import StreetName from '../streets/StreetName'
import { isSignedIn } from '../users/authentication'
import { getSettings } from '../users/settings'
import { registerKeypress, deregisterKeypress } from './keypress'
import { MODES, getMode } from './mode'
import { goNewStreet } from './routing'
import React from 'react'
import ReactDOM from 'react-dom'
import Avatar from './Avatar'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'

let settingsWelcomeDismissed = false
let isVisible = false

export function attachWelcomeEventListeners () {
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
}

function showWelcome (welcomeType = WELCOME_NONE) {
  loadSettingsWelcomeDismissed()

  if (getMode() === MODES.NEW_STREET) {
    if (isSignedIn() || settingsWelcomeDismissed) {
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

  const welcomeEl = document.querySelector('#welcome')
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

      let street = getStreet()
      ReactDOM.render(<StreetName street={street} />, document.getElementById('welcome-street-name'))

      if (street.creatorId) {
        document.querySelector('#welcome-avatar-creator').classList.add('visible')

        ReactDOM.render(<Avatar userId={street.creatorId} />, document.getElementById('welcome-avatar'))
        document.getElementById('welcome-creator').textContent = street.creatorId
      }

      break
    case WELCOME_NEW_STREET:
      welcomeEl.classList.add('new-street')
      let settings = getSettings()
      switch (settings.newStreetPreference) {
        case NEW_STREET_EMPTY:
          document.querySelector('#new-street-empty').checked = true
          break
        case NEW_STREET_DEFAULT:
          document.querySelector('#new-street-default').checked = true
          break
      }

      if (settings.priorLastStreetId && settings.priorLastStreetId !== getStreet().id) {
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

  const welcomeEl = document.querySelector('#welcome')
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

