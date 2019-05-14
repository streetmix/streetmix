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
    priorLastStreetId: null
  }

  constructor (props) {
    super(props)

    this.state = {
      visible: false,
      welcomeType: WELCOME_NONE,
      welcomeDismissed: this.getSettingsWelcomeDismissed(),
      selectedNewStreetType: null
    }
  }

  componentDidMount () {
    // Show welcome panel on load
    window.addEventListener('stmx:everything_loaded', this.showWelcome)

    // Hide welcome panel on certain events
    window.addEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.addEventListener('stmx:save_street', this.hideWelcome)
  }

  componentWillUnmount () {
    // Clean up event listeners
    window.removeEventListener('stmx:everything_loaded', this.showWelcome)
    window.removeEventListener('stmx:receive_gallery_street', this.hideWelcome)
    window.removeEventListener('stmx:save_street', this.hideWelcome)
  }

  showWelcome = () => {
    // Do not show if app is read-only
    if (this.props.readOnly) {
      return
    }

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

    // If welcomeType is still none, abort
    if (welcomeType === WELCOME_NONE) {
      return
    }

    // If welcomeType is WELCOME_NEW_STREET, there is an additional state
    // property that determines which of the new street modes is selected
    let selectedNewStreetType

    switch (this.props.newStreetPreference) {
      case NEW_STREET_EMPTY:
        selectedNewStreetType = 'new-street-empty'
        break
      case NEW_STREET_DEFAULT:
        selectedNewStreetType = 'new-street-default'
        break
      default:
        break
    }

    // Record state
    this.setState({
      visible: true,
      welcomeType,
      selectedNewStreetType
    })

    // The StreetNameCanvas might stick out from underneath the WelcomePanel
    // if it's visible, so momentarily keep the UI clean by hiding it until
    // the WelcomePanel goes away.
    this.props.hideStreetNameCanvas()

    // Set up keypress listener to close welcome panel
    registerKeypress('esc', this.hideWelcome)
  }

  hideWelcome = () => {
    // Certain events will hide the welcome panel, if visible.
    // Here we check to make sure it is visible before doing anything else.
    if (this.state.visible === false) {
      return
    }

    this.setState({
      visible: false,
      welcomeDismissed: true
    })
    this.setSettingsWelcomeDismissed(true)

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

  setSettingsWelcomeDismissed (value = true) {
    window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] = JSON.stringify(value)

    // When dismissed, set what's new timestamp to now so that the what's new
    // dialog doesn't get shown until it's actually new for this user.
    // TODO: use constants for localStorage keys.
    if (value === true) {
      window.localStorage['whatsnew-last-timestamp'] = Date.now()
    }
  }

  onClickGoNewStreet = (event) => {
    this.setState({ welcomeDismissed: true })
    this.setSettingsWelcomeDismissed(true)
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

    // If visible, set the `visible` class on the container
    let classes = 'welcome-panel-container'

    if (this.state.visible) {
      classes += ' visible'
    }

    return (
      <div className={classes}>
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
    newStreetPreference: state.settings.newStreetPreference,
    priorLastStreetId: state.settings.priorLastStreetId,
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    hideStreetNameCanvas: () => { dispatch(hideStreetNameCanvas()) },
    showStreetNameCanvas: () => { dispatch(showStreetNameCanvas()) },
    getLastStreet: () => { dispatch(getLastStreet()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WelcomePanel)
