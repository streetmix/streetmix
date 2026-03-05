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
import { getIsReturningUser, setIsReturningUser } from './localstorage.js'
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

function determineWelcomeType(coastmixMode: boolean): number {
  let type = WELCOME_NONE
  const mode = getMode()
  const isReturningUser = getIsReturningUser()

  // Custom welcome type for Coastmix mode.
  // TODO: any messaging changes for new streets?
  if (coastmixMode) {
    if (!isReturningUser) {
      type = WELCOME_FIRST_TIME_COASTMIX
    } else if (
      mode === MODES.NEW_STREET ||
      mode === MODES.NEW_STREET_COPY_LAST
    ) {
      type = WELCOME_NEW_STREET_COASTMIX
    }
  } else if (mode === MODES.NEW_STREET || mode === MODES.NEW_STREET_COPY_LAST) {
    if (isSignedIn() || isReturningUser) {
      type = WELCOME_NEW_STREET
    } else {
      type = WELCOME_FIRST_TIME_NEW_STREET
    }
  } else {
    if (!isReturningUser) {
      type = WELCOME_FIRST_TIME_EXISTING_STREET
    }
  }

  return type
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
  const type = determineWelcomeType(coastmixMode)

  // Do not show under the following conditions:
  // If app is read-only
  // If user has dismissed the panel this session
  // If the welcome type is `WELCOME_NONE`
  //
  // When rendering, the dispatch call below affects the state of another
  // component (`StreetNameplateContainer`), which throws an error in React.
  // This is considered a bug, despite the functionality behaving as expected.
  // The fix is to wrap this in `useEffect` so that the dispatch call occurs
  // after the render is done. For more information see the discussion at
  // https://github.com/streetmix/streetmix/issues/2324
  useEffect(() => {
    if (!readOnly && !isDismissed && type !== WELCOME_NONE) {
      dispatch(setWelcomePanelVisible(true))
    }
  }, [readOnly, type])

  // Handler function is a callback to prevent re-running effects
  const handleDismissed = useCallback(() => {
    setIsReturningUser()
    dispatch(setWelcomePanelDismissed())
  }, [dispatch])

  // Set up and tear down when a welcome panel is shown
  useEffect(() => {
    if (!isVisible) return

    // Hide welcome panel on certain events
    // TODO: Consider dispatching from elsewhere, and not via event listeners
    window.addEventListener('stmx:receive_gallery_street', handleDismissed)
    window.addEventListener('stmx:save_street', handleDismissed)

    // Hide welcome panel when someone presses Escape
    registerKeypress('esc', handleDismissed)

    return () => {
      // Clean up event listeners
      window.removeEventListener('stmx:receive_gallery_street', handleDismissed)
      window.removeEventListener('stmx:save_street', handleDismissed)
      deregisterKeypress('esc', handleDismissed)
    }
  }, [isVisible, dispatch, handleDismissed])

  // Figure out what to display inside the panel
  let content
  switch (type) {
    case WELCOME_FIRST_TIME_NEW_STREET:
      content = <FirstTimeNewStreet />
      break
    case WELCOME_FIRST_TIME_EXISTING_STREET:
      content = <FirstTimeExistingStreet />
      break
    case WELCOME_NEW_STREET:
    case WELCOME_NEW_STREET_COASTMIX:
      content = <WelcomeNewStreet handleDismiss={handleDismissed} />
      break
    case WELCOME_FIRST_TIME_COASTMIX:
      content = <WelcomeCoastmix handleDismiss={handleDismissed} />
      break
    case WELCOME_NONE:
    default:
      content = null
      break
  }

  // Don't display if not visible, has already been dismissed this session,
  // or when there is no content to show
  if (!isVisible || isDismissed || content === null) {
    return null
  }

  return (
    <div className="welcome-panel-container">
      <div className="welcome-panel">
        <CloseButton onClick={handleDismissed} />
        {content}
      </div>
    </div>
  )
}
