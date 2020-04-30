import React, { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { isSignedIn } from '../users/authentication'
import { registerKeypress, deregisterKeypress } from './keypress'
import { MODES, getMode } from './mode'
import { showStreetNameplate, hideStreetNameplate } from '../store/slices/ui'
import CloseButton from '../ui/CloseButton'
import WelcomeNewStreet from './WelcomePanel/NewStreet'
import WelcomeFirstTimeExistingStreet from './WelcomePanel/FirstTimeExistingStreet'
import WelcomeFirstTimeNewStreet from './WelcomePanel/FirstTimeNewStreet'
import './WelcomePanel.scss'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_WELCOME_DISMISSED = 'settings-welcome-dismissed'

function WelcomePanel (props) {
  const { readOnly, everythingLoaded } = useSelector((state) => state.app)
  const dispatch = useDispatch()
  const [welcomeType, setWelcomeType] = useState(null)
  const [isDismissed, setDismissed] = useState(getDismissedFromLocalStorage())

  const handleHideWelcome = useCallback(() => {
    // Certain events will dismiss the welcome panel. If already
    // invisible, do nothing.
    if (welcomeType === WELCOME_NONE) {
      return
    }

    setWelcomeType(WELCOME_NONE)
    setDismissed(true)
    setDismissedInLocalStorage()
  }, [welcomeType])

  // When everything is loaded, determine what type of welcome panel to show
  useEffect(() => {
    function determineWelcomeType () {
      let welcomeType = WELCOME_NONE

      if (getMode() === MODES.NEW_STREET) {
        if (isSignedIn() || isDismissed) {
          welcomeType = WELCOME_NEW_STREET
        } else {
          welcomeType = WELCOME_FIRST_TIME_NEW_STREET
        }
      } else {
        if (!isDismissed) {
          welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET
        }
      }

      return welcomeType
    }

    if (everythingLoaded === true) {
      setWelcomeType(determineWelcomeType())
    }
  }, [everythingLoaded, isDismissed])

  // Set up and tear down when a welcome panel is shown
  useEffect(() => {
    // Do nothing with this hook if there's no welcome type
    if (welcomeType === WELCOME_NONE) return

    // Hide welcome panel on certain events
    window.addEventListener('stmx:receive_gallery_street', handleHideWelcome)
    window.addEventListener('stmx:save_street', handleHideWelcome)

    // Hide welcome panel when someone presses Escape
    registerKeypress('esc', handleHideWelcome)

    // <StreetNameplateContainer /> might stick out from underneath the panel
    // when it's visible, so momentarily keep the UI clean by hiding it until
    // the panel goes away.
    dispatch(hideStreetNameplate())

    return () => {
      // Clean up event listeners
      window.removeEventListener(
        'stmx:receive_gallery_street',
        handleHideWelcome
      )
      window.removeEventListener('stmx:save_street', handleHideWelcome)
      deregisterKeypress('esc', handleHideWelcome)

      // Make the <StreetNameplateContainer /> re-appear
      dispatch(showStreetNameplate())
    }
  }, [welcomeType, dispatch, handleHideWelcome])

  // Do not show under the following conditions:
  // If app is read-only
  if (readOnly) return null

  // If app has not fully loaded yet
  if (everythingLoaded === false) return null

  // Figure out what to display inside the panel
  let welcomeContent
  switch (welcomeType) {
    case WELCOME_FIRST_TIME_NEW_STREET:
      welcomeContent = <WelcomeFirstTimeNewStreet />
      break
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      welcomeContent = <WelcomeFirstTimeExistingStreet />
      break
    case WELCOME_NEW_STREET:
      welcomeContent = <WelcomeNewStreet />
      break
    case WELCOME_NONE:
    default:
      welcomeContent = null
      break
  }

  // Do not render if there is no content to display
  if (!welcomeContent) {
    return null
  }

  return (
    <div className="welcome-panel-container">
      <div className="welcome-panel">
        <CloseButton onClick={handleHideWelcome} />
        {welcomeContent}
      </div>
    </div>
  )
}

export default WelcomePanel

/**
 * Remember whether the WelcomePanel has been dismissed in LocalStorage
 */
export function setDismissedInLocalStorage () {
  window.localStorage[LOCAL_STORAGE_WELCOME_DISMISSED] = 'true'
}

/**
 * Retrieves LocalStorage state for whether WelcomePanel has been dismissed
 */
function getDismissedFromLocalStorage () {
  const localSetting = window.localStorage[LOCAL_STORAGE_WELCOME_DISMISSED]

  if (localSetting) {
    return JSON.parse(localSetting)
  }

  return false
}
