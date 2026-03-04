import { useEffect, useCallback } from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  setWelcomePanelVisible,
  setWelcomePanelDismissed,
} from '~/src/store/slices/ui.js'
import { isSignedIn } from '~/src/users/authentication.js'
import { CloseButton } from '~/src/ui/CloseButton.js'
import { registerKeypress, deregisterKeypress } from '../keypress.js'
import { MODES, getMode } from '../mode.js'
import {
  getIsReturningUserFromLocalStorage,
  setIsReturningUserInLocalStorage,
} from './localstorage.js'
import { FirstTimeExistingStreet } from './FirstTimeExistingStreet.js'
import { FirstTimeNewStreet } from './FirstTimeNewStreet.js'
import { WelcomeNewStreet } from './WelcomeNewStreet.js'
import { WelcomeCoastmix } from './WelcomeCoastmix.js'
import './WelcomePanel.css'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3
const WELCOME_NEW_STREET_COASTMIX = 4
const WELCOME_FIRST_TIME_COASTMIX = 5

function determineWelcomeType(
  isReturningUser: boolean,
  coastmixMode: boolean
): number {
  let welcomeType = WELCOME_NONE

  // Custom welcome type for Coastmix mode.
  // TODO: any messaging changes for new streets?
  if (coastmixMode) {
    if (
      getMode() === MODES.NEW_STREET ||
      getMode() === MODES.NEW_STREET_COPY_LAST
    ) {
      welcomeType = WELCOME_NEW_STREET_COASTMIX
    } else {
      welcomeType = WELCOME_FIRST_TIME_COASTMIX
    }
  } else if (
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

export function WelcomePanel() {
  const { readOnly } = useSelector((state) => state.app)
  const { welcomePanelVisible: isVisible, welcomePanelDismissed: isDismissed } =
    useSelector((state) => state.ui)
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )
  const dispatch = useDispatch()

  // Determine what type of welcome panel to show
  const isReturningUser = getIsReturningUserFromLocalStorage()
  const welcomeType = determineWelcomeType(isReturningUser, coastmixMode)

  // Do not show under the following conditions:
  // If app is read-only
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
    if (!readOnly && !isDismissed && welcomeType !== WELCOME_NONE) {
      dispatch(setWelcomePanelVisible())
    }
  }, [readOnly, isDismissed, welcomeType])

  const handleWelcomeDismissed = useCallback(() => {
    // Certain events will dismiss the welcome panel. If already
    // invisible, do nothing.
    if (welcomeType === WELCOME_NONE) {
      return
    }

    setIsReturningUserInLocalStorage()
    dispatch(setWelcomePanelDismissed())
  }, [welcomeType, dispatch])

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
      welcomeContent = <FirstTimeNewStreet />
      break
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      welcomeContent = <FirstTimeExistingStreet />
      break
    case WELCOME_NEW_STREET:
      welcomeContent = (
        <WelcomeNewStreet handleDismiss={handleWelcomeDismissed} />
      )
      break
    case WELCOME_NEW_STREET_COASTMIX:
    case WELCOME_FIRST_TIME_COASTMIX:
      welcomeContent = <WelcomeCoastmix />
      break
    case WELCOME_NONE:
    default:
      welcomeContent = null
      break
  }

  // Do not render if the panel is not visible
  // (but not for Coastmix welcome types)
  if (
    !isVisible &&
    welcomeType !== WELCOME_FIRST_TIME_COASTMIX &&
    welcomeType !== WELCOME_NEW_STREET_COASTMIX
  )
    return null

  return (
    <div className="welcome-panel-container">
      <div className="welcome-panel">
        <CloseButton onClick={handleWelcomeDismissed} />
        {welcomeContent}
      </div>
    </div>
  )
}
