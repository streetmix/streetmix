import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import {
  NEW_STREET_DEFAULT,
  NEW_STREET_EMPTY,
  onNewStreetDefaultClick,
  onNewStreetEmptyClick
} from '../streets/creation'
import StreetName from '../streets/StreetName'
import { isSignedIn } from '../users/authentication'
import { registerKeypress, deregisterKeypress } from './keypress'
import { MODES, getMode } from './mode'
import { goNewStreet } from './routing'
import Avatar from '../users/Avatar'
import { showStreetNameCanvas, hideStreetNameCanvas } from '../store/actions/ui'
import { getLastStreet } from '../store/actions/street'
import CloseButton from '../ui/CloseButton'

import './WelcomePanel.scss'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'

export class WelcomePanel extends React.Component {
  static propTypes = {
    touch: PropTypes.bool,
    readOnly: PropTypes.bool,
    everythingLoaded: PropTypes.bool,
    newStreetPreference: PropTypes.number,
    priorLastStreetId: PropTypes.string,
    street: PropTypes.object,
    showStreetNameCanvas: PropTypes.func,
    hideStreetNameCanvas: PropTypes.func,
    getLastStreet: PropTypes.func
  }

  static defaultProps = {
    touch: false,
    readOnly: false,
    everythingLoaded: false,
    priorLastStreetId: null
  }

  constructor (props) {
    super(props)

    // If welcomeType is WELCOME_NEW_STREET, there is an additional state
    // property that determines which of the new street modes is selected
    let selectedNewStreetType
    switch (props.newStreetPreference) {
      case NEW_STREET_EMPTY:
        selectedNewStreetType = 'new-street-empty'
        break
      case NEW_STREET_DEFAULT:
      default:
        selectedNewStreetType = 'new-street-default'
        break
    }

    this.state = {
      welcomeType: null,
      welcomeDismissed: this.getSettingsWelcomeDismissed(),
      selectedNewStreetType: selectedNewStreetType
    }
  }

  componentDidMount () {
    // Hide welcome panel on certain events
    window.addEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.addEventListener('stmx:save_street', this.hideWelcome)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.everythingLoaded === false && this.props.everythingLoaded === true) {
      // The StreetNameCanvas might stick out from underneath the WelcomePanel
      // if it's visible, so momentarily keep the UI clean by hiding it until
      // the WelcomePanel goes away.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        welcomeType: this.getWelcomeType()
      })

      // Set up keypress listener to close welcome panel
      registerKeypress('esc', this.hideWelcome)
    }

    if (this.state.welcomeType) {
      this.props.hideStreetNameCanvas()
    }
    // These changes will be reversed in this.hideWelcome()
  }

  componentWillUnmount () {
    // Clean up event listeners
    window.removeEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.removeEventListener('stmx:save_street', this.hideWelcome)
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
    this.setSettingsWelcomeDismissed()

    // Make the StreetNameCanvas re-appear
    this.props.showStreetNameCanvas()

    // Remove keypress listener
    deregisterKeypress('esc', this.hideWelcome)
  }

  getSettingsWelcomeDismissed () {
    const localSetting = window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED]

    if (localSetting) {
      return JSON.parse(localSetting)
    }

    return false
  }

  setSettingsWelcomeDismissed () {
    window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] = 'true'
  }

  onClickGoNewStreet = (event) => {
    this.setSettingsWelcomeDismissed()
    goNewStreet(true)
  }

  // The following handler is only used with the WELCOME_NEW_STREET mode.
  // It handles changing the "checked" state of the input buttons.
  onChangeNewStreetType = (event) => {
    this.setState({
      selectedNewStreetType: event.target.id
    })
  }

  render () {
    // Do not show under the following conditions:
    // If app is read-only
    if (this.props.readOnly) return null

    // If app has not fully loaded yet
    if (this.props.everythingLoaded === false) return null

    let welcomeContent

    // Figure out what to display inside the panel
    switch (this.state.welcomeType) {
      case WELCOME_FIRST_TIME_NEW_STREET:
        welcomeContent = (
          <div className="welcome-panel-content first-time-new-street">
            <h1>
              <FormattedMessage id="dialogs.welcome.heading" defaultMessage="Welcome to Streetmix." />
            </h1>
            <p>
              <FormattedMessage
                id="dialogs.welcome.new.intro"
                defaultMessage="Design, remix, and share your neighborhood street.
                  Add trees or bike paths, widen sidewalks or traffic lanes, learn
                  how your decisions can impact your community."
              />
            </p>
            <p className="important">
              <FormattedMessage
                id="dialogs.welcome.new.instruct"
                defaultMessage="Start by moving some segments around with {pointer}."
                values={{
                  pointer: (this.props.touch)
                    ? <FormattedMessage id="dialogs.welcome.new.instruct-pointer-finger" defaultMessage="your finger" />
                    : <FormattedMessage id="dialogs.welcome.new.instruct-pointer-mouse" defaultMessage="your mouse" />
                }}
              />
            </p>
          </div>
        )
        break
      case WELCOME_FIRST_TIME_EXISTING_STREET:
        const street = this.props.street

        welcomeContent = (
          <div className="welcome-panel-content first-time-existing-street">
            <h1>
              <FormattedMessage id="dialogs.welcome.heading" defaultMessage="Welcome to Streetmix." />
            </h1>
            {/* Enclose child elements in a paragraph-like <div> to get around
                React's warning that <div> elements from StreetName and
                Avatar components cannot exist inside a <p> */}
            <div className="paragraph">
              {(() => {
                // Display street creator if creatorId is available.
                if (street.creatorId) {
                  return (
                    <FormattedMessage
                      id="dialogs.welcome.existing.intro"
                      defaultMessage="This is {streetName} made by {creator}."
                      values={{
                        streetName: <StreetName name={street.name} />,
                        creator: <React.Fragment><Avatar userId={street.creatorId} /> {street.creatorId}</React.Fragment>
                      }}
                    />
                  )
                } else {
                  return (
                    <FormattedMessage
                      id="dialogs.welcome.existing.intro-without-creator"
                      defaultMessage="This is {streetName}."
                      values={{
                        streetName: <StreetName name={street.name} />
                      }}
                    />
                  )
                }
              })()}
            </div>
            <p className="important">
              <FormattedMessage
                id="dialogs.welcome.existing.instruct"
                defaultMessage="Remix it by moving some segments around, or {startYourOwnStreet}."
                values={{
                  startYourOwnStreet: (
                    <button onClick={this.onClickGoNewStreet}>
                      <FormattedMessage id="dialogs.welcome.existing.instruct-start-own-street" defaultMessage="Start your own street" />
                    </button>
                  )
                }}
              />
            </p>
          </div>
        )

        break
      case WELCOME_NEW_STREET:
        welcomeContent = (
          <div className="welcome-panel-content new-street">
            <h1>
              <FormattedMessage id="dialogs.new-street.heading" defaultMessage="Here’s your new street." />
            </h1>
            <ul>
              <li>
                <input
                  type="radio"
                  name="new-street"
                  id="new-street-default"
                  checked={this.state.selectedNewStreetType === 'new-street-default' || !this.state.selectedNewStreetType}
                  onChange={this.onChangeNewStreetType}
                  onClick={onNewStreetDefaultClick}
                />
                <label htmlFor="new-street-default">
                  <FormattedMessage id="dialogs.new-street.default" defaultMessage="Start with an example street" />
                </label>
              </li>
              <li>
                <input
                  type="radio"
                  name="new-street"
                  id="new-street-empty"
                  checked={this.state.selectedNewStreetType === 'new-street-empty'}
                  onChange={this.onChangeNewStreetType}
                  onClick={onNewStreetEmptyClick}
                />
                <label htmlFor="new-street-empty">
                  <FormattedMessage id="dialogs.new-street.empty" defaultMessage="Start with an empty street" />
                </label>
              </li>
              {(() => {
                // Display this button only if there is a previous street to copy
                // from that is not the same as the current street
                if (this.props.priorLastStreetId && this.props.priorLastStreetId !== this.props.street.id) {
                  return (
                    <li>
                      <input
                        type="radio"
                        name="new-street"
                        id="new-street-last"
                        checked={this.state.selectedNewStreetType === 'new-street-last'}
                        onChange={this.onChangeNewStreetType}
                        onClick={this.props.getLastStreet}
                      />
                      <label htmlFor="new-street-last">
                        <FormattedMessage id="dialogs.new-street.last" defaultMessage="Start with a copy of last street" />
                      </label>
                    </li>
                  )
                }

                return null
              })()}
            </ul>
          </div>
        )

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
    touch: state.system.touch,
    readOnly: state.app.readOnly || state.system.phone,
    everythingLoaded: state.app.everythingLoaded,
    newStreetPreference: state.settings.newStreetPreference,
    priorLastStreetId: state.settings.priorLastStreetId,
    street: state.street
  }
}

const mapDispatchToProps = {
  hideStreetNameCanvas,
  showStreetNameCanvas,
  getLastStreet
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePanel)
