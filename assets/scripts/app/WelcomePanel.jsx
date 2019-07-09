import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isSignedIn } from '../users/authentication'
import { registerKeypress, deregisterKeypress } from './keypress'
import { MODES, getMode } from './mode'
import { showStreetNameCanvas, hideStreetNameCanvas } from '../store/actions/ui'
import CloseButton from '../ui/CloseButton'
import WelcomeNewStreet from './WelcomePanel/NewStreet'
import WelcomeFirstTimeExistingStreet from './WelcomePanel/FirstTimeExistingStreet'
import WelcomeFirstTimeNewStreet from './WelcomePanel/FirstTimeNewStreet'
import './WelcomePanel.scss'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'

export class WelcomePanel extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    everythingLoaded: PropTypes.bool,
    showStreetNameCanvas: PropTypes.func,
    hideStreetNameCanvas: PropTypes.func
  }

  static defaultProps = {
    readOnly: false,
    everythingLoaded: false
  }

  constructor (props) {
    super(props)

    this.state = {
      welcomeType: null,
      welcomeDismissed: getSettingsWelcomeDismissed()
    }
  }

  componentDidMount () {
    // Hide welcome panel on certain events
    window.addEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.addEventListener('stmx:save_street', this.hideWelcome)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.everythingLoaded === false && this.props.everythingLoaded === true) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        welcomeType: this.getWelcomeType()
      })

      // Set up keypress listener to close welcome panel
      registerKeypress('esc', this.hideWelcome)
    }

    // The StreetNameCanvas might stick out from underneath the WelcomePanel
    // if it's visible, so momentarily keep the UI clean by hiding it until
    // the WelcomePanel goes away.
    // This will be cleaned up in this.hideWelcome()
    if (this.state.welcomeType) {
      this.props.hideStreetNameCanvas()
    }
  }

  componentWillUnmount () {
    // Clean up event listeners
    window.removeEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.removeEventListener('stmx:save_street', this.hideWelcome)
    deregisterKeypress('esc', this.hideWelcome)
  }

  getWelcomeType = () => {
    let welcomeType = WELCOME_NONE

    if (getMode() === MODES.NEW_STREET) {
      if (isSignedIn() || this.state.welcomeDismissed) {
        welcomeType = WELCOME_NEW_STREET
      } else {
        welcomeType = WELCOME_FIRST_TIME_NEW_STREET
      }
    } else {
      if (!this.state.welcomeDismissed) {
        welcomeType = WELCOME_FIRST_TIME_EXISTING_STREET
      }
    }

    return welcomeType
  }

  hideWelcome = () => {
    // Certain events will dismiss the welcome panel. If already
    // invisible, do nothing.
    if (!this.state.welcomeType) {
      return
    }

    this.setState({
      welcomeType: null,
      welcomeDismissed: true
    })
    setSettingsWelcomeDismissed()

    // Make the StreetNameCanvas re-appear
    this.props.showStreetNameCanvas()

    // Remove keypress listener
    deregisterKeypress('esc', this.hideWelcome)
  }

  render () {
    // Do not show under the following conditions:
    // If app is read-only
    if (this.props.readOnly) return null

    // If app has not fully loaded yet
    if (this.props.everythingLoaded === false) return null

    // Figure out what to display inside the panel
    let welcomeContent
    switch (this.state.welcomeType) {
      case WELCOME_FIRST_TIME_NEW_STREET:
        welcomeContent = <WelcomeFirstTimeNewStreet />
        break
      case WELCOME_FIRST_TIME_EXISTING_STREET:
        welcomeContent = <WelcomeFirstTimeExistingStreet />
        break
      case WELCOME_NEW_STREET:
        welcomeContent = <WelcomeNewStreet />
        break
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
          <CloseButton onClick={this.hideWelcome} />
          {welcomeContent}
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    readOnly: state.app.readOnly || state.system.phone,
    everythingLoaded: state.app.everythingLoaded
  }
}

const mapDispatchToProps = {
  hideStreetNameCanvas,
  showStreetNameCanvas
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePanel)

/**
 * Remember whether the WelcomePanel has been dismissed in LocalStorage
 */
export function setSettingsWelcomeDismissed () {
  window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] = 'true'
}

/**
 * Retrieves LocalStorage state for whether WelcomePanel has been dismissed
 */
function getSettingsWelcomeDismissed () {
  const localSetting = window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]

  if (localSetting) {
    return JSON.parse(localSetting)
  }

  return false
}
