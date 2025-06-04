import React, { useState, useEffect, useCallback } from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  setWelcomePanelVisible,
  setWelcomePanelDismissed
} from '~/src/store/slices/ui'
import { isSignedIn } from '~/src/users/authentication'
import CloseButton from '~/src/ui/CloseButton'
import { registerKeypress, deregisterKeypress } from '../keypress'
import { MODES, getMode } from '../mode'
import WelcomeNewStreet from './NewStreet'
import WelcomeFirstTimeExistingStreet from './FirstTimeExistingStreet'
import WelcomeFirstTimeNewStreet from './FirstTimeNewStreet'
import './WelcomePanel.css'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

// In the past, dismissing the welcome panel would set this flag in
// LocalStorage, and the next time a welcome panel would be shown for a
// returning user, the presence of this flag would show different content (or
// not display the welcome panel at all).
//
// This naming convention caused confusion during the conversion to a
// React function component, because in reality there are two states we care
// about:
// - the welcome panel is dismissed _for the session_ (and will not re-apppear
//   _this session_)
// - the user is a first-time user, and dismissing the welcome panel changes
//   its content _in the future_
//
// The first value is ephemeral state, ao it is set only for the duration of
// the session and is discarded if the tab is closed. We want to keep using
// `dismissed` to label this state.
//
// The second value is persistent state. This is the one that's saved to
// LocalStorage and is retrieved when the app is loaded to determine what
// type of welcome message will be displayed. The LocalStorage key name
// is now no longer what it means, but for now we keep it for backwards
// compatibility
const LOCAL_STORAGE_RETURNING_USER = 'settings-welcome-dismissed'

function WelcomePanel (): React.ReactElement | null {
  const { readOnly, everythingLoaded } = useSelector((state) => state.app)
  const { welcomePanelVisible: isVisible, welcomePanelDismissed: isDismissed } =
    useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const [welcomeType, setWelcomeType] = useState(WELCOME_NONE)
  const [isReturningUser, setIsReturningUser] = useState(
    getIsReturningUserFromLocalStorage()
  )

  // Do not show under the following conditions:
  // If app is read-only
  // If app has not fully loaded yet
  // If user has dismissed the panel this session
  // If the welcome type is WELCOME_NONE
  //
  // When rendering, the dispatch call below affects the state of another
  // component (`StreetNameplateContainer`), which throws an error in React.
  // This is considered a bug, despite the functionality behaving as expected.
  // The fix is to wrap this in `useEffect` so that the dispatch call occurs
  // after the render is done. For more information see the discussion at
  // https://github.com/streetmix/streetmix/issues/2324
  useEffect(() => {
    if (
      !readOnly &&
      everythingLoaded &&
      !isDismissed &&
      welcomeType !== WELCOME_NONE
    ) {
      dispatch(setWelcomePanelVisible())
    }
  })

  const handleWelcomeDismissed = useCallback(() => {
    // Certain events will dismiss the welcome panel. If already
    // invisible, do nothing.
    if (welcomeType === WELCOME_NONE) {
      return
    }

    setWelcomeType(WELCOME_NONE)
    setIsReturningUser(true)
    setIsReturningUserInLocalStorage()
    dispatch(setWelcomePanelDismissed())
  }, [welcomeType, dispatch])

  // When everything is loaded, determine what type of welcome panel to show
  useEffect(() => {
    function determineWelcomeType (): number {
      let welcomeType = WELCOME_NONE

      if (
        getMode() === MODES.NEW_STREET ||
        getMode() === MODES.NEW_STREET_COPY_LAST
      ) {
        if (isSignedIn() || isReturningUser) {
          welcomeType = WELCOME_NEW_STREET
        } else {
          welcomeType = WELCOME_FIRST_TIME_NEW_STREET
        }
      } else {
        if (!isReturningUser) {
          welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET
        }
      }

      return welcomeType
    }

    if (everythingLoaded) {
      setWelcomeType(determineWelcomeType())
    }
  }, [everythingLoaded, isReturningUser])

  // Set up and tear down when a welcome panel is shown
  useEffect(() => {
    // Do nothing with this hook if the panel is not visible
    if (!isVisible) return

    // Hide welcome panel on certain events
    window.addEventListener(
      'stmx:receive_gallery_street',
      handleWelcomeDismissed
    )
    window.addEventListener('stmx:save_street', handleWelcomeDismissed)

    // Hide welcome panel when someone presses Escape
    registerKeypress('esc', handleWelcomeDismissed)

    return () => {
      // Clean up event listeners
      window.removeEventListener(
        'stmx:receive_gallery_street',
        handleWelcomeDismissed
      )
      window.removeEventListener('stmx:save_street', handleWelcomeDismissed)
      deregisterKeypress('esc', handleWelcomeDismissed)
    }
  }, [isVisible, dispatch, handleWelcomeDismissed])

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
      welcomeContent = (
        <WelcomeNewStreet handleDismiss={handleWelcomeDismissed} />
      )
      break
    case WELCOME_NONE:
    default:
      welcomeContent = null
      break
  }

  // Do not render if the panel is not visible
  if (!isVisible) return null

  return (
    <div className="welcome-panel-container">
      <div className="welcome-panel">
        <CloseButton onClick={handleWelcomeDismissed} />
        {welcomeContent}
      </div>
    </div>
  )
}

export default WelcomePanel

/**
 * When the Welcome Panel is dismissed for the first time we mark this browser
 * as a "returning user" so that the message is not geared toward first-time
 * users the next time they visit the site.
 */
export function setIsReturningUserInLocalStorage (): void {
  window.localStorage.setItem(LOCAL_STORAGE_RETURNING_USER, 'true')
}

/**
 * Retrieves LocalStorage state for whether whether user is a returning user
 */
function getIsReturningUserFromLocalStorage (): boolean {
  const localSetting = window.localStorage.getItem(LOCAL_STORAGE_RETURNING_USER)

  if (localSetting !== null) {
    return JSON.parse(localSetting)
  }

  return false
}
