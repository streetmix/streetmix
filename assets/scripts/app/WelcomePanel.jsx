import React from 'react'

import { app } from '../preinit/app_settings'
import { system } from '../preinit/system_capabilities'
import {
  NEW_STREET_DEFAULT,
  NEW_STREET_EMPTY,
  onNewStreetDefaultClick,
  onNewStreetEmptyClick,
  onNewStreetLastClick
} from '../streets/creation'
import { getStreet } from '../streets/data_model'
import StreetName from '../streets/StreetName'
import { isSignedIn } from '../users/authentication'
import { getSettings } from '../users/settings'
import { registerKeypress, deregisterKeypress } from './keypress'
import { MODES, getMode } from './mode'
import { goNewStreet } from './routing'
import Avatar from './Avatar'

const WELCOME_NONE = 0
const WELCOME_NEW_STREET = 1
const WELCOME_FIRST_TIME_NEW_STREET = 2
const WELCOME_FIRST_TIME_EXISTING_STREET = 3

const LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED = 'settings-welcome-dismissed'

export default class WelcomePanel extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      visible: false,
      welcomeType: WELCOME_NONE,
      welcomeDismissed: this.getSettingsWelcomeDismissed(),
      selectedNewStreetType: null
    }

    this.showWelcome = this.showWelcome.bind(this)
    this.hideWelcome = this.hideWelcome.bind(this)
    this.onClickGoNewStreet = this.onClickGoNewStreet.bind(this)
    this.onChangeNewStreetType = this.onChangeNewStreetType.bind(this)
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

  showWelcome () {
    // Do not do anything in these cases
    if (app.readOnly || system.phone) {
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
    const settings = getSettings()

    let selectedNewStreetType

    switch (settings.newStreetPreference) {
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

    // TODO: Don't hide this by querying DOM directly
    document.querySelector('#street-name-canvas').classList.add('hidden')

    // Set up keypress listener to close welcome panel
    registerKeypress('esc', this.hideWelcome)
  }

  hideWelcome () {
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

    // TODO: Don't show this by querying DOM directly
    document.querySelector('#street-name-canvas').classList.remove('hidden')

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
    window.localStorage[LOCAL_STORAGE_SETTINGS_WELCOME_DISMISSED] =
      JSON.stringify(value)
  }

  onClickGoNewStreet (event) {
    this.setState({ welcomeDismissed: true })
    this.setSettingsWelcomeDismissed(true)
    goNewStreet(true)
  }

  // The following handler is only used with the WELCOME_NEW_STREET mode.
  // It handles changing the "checked" state of the input buttons.
  onChangeNewStreetType (event) {
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
          <div className='welcome-panel-content first-time-new-street'>
            <h1 data-i18n='dialogs.welcome.heading'>
              Welcome to Streetmix.
            </h1>
            <p>
              Design, remix, and share your neighborhood street. Add trees or bike paths, widen
              sidewalks or traffic lanes, learn how your decisions can impact your community.
            </p>
            <p className='important'>
              Start by moving some segments around
              with <span className='touch-only'>your finger</span><span className='non-touch-only'>your mouse</span>.
            </p>
          </div>
        )
        break
      case WELCOME_FIRST_TIME_EXISTING_STREET:
        const street = getStreet()

        welcomeContent = (
          <div className='welcome-panel-content first-time-existing-street'>
            <h1 data-i18n='dialogs.welcome.heading'>
              Welcome to Streetmix.
            </h1>
            {/* Enclose child elements in a paragraph-like <div> to get around
                React's warning that <div> elements from StreetName and
                Avatar components cannot exist inside a <p> */}
            <div className='paragraph'>
              This is <StreetName street={street} />
              {(() => {
                // Display street creator if creatorId is available.
                if (street.creatorId) {
                  return (
                    <span>
                      made by <Avatar userId={street.creatorId} /> {street.creatorId}
                    </span>
                  )
                }

                return null
              })()}
              .
            </div>
            <p className='important'>
              Remix it by moving some segments around,
              or <button onClick={this.onClickGoNewStreet}>Start your own street</button>.
            </p>
          </div>
        )

        break
      case WELCOME_NEW_STREET:
        welcomeContent = (
          <div className='welcome-panel-content new-street'>
            <h1 data-i18n='dialogs.new-street.heading'>
              Here’s your new street.
            </h1>
            <ul>
              <li>
                <input
                  type='radio'
                  name='new-street'
                  id='new-street-default'
                  checked={this.state.selectedNewStreetType === 'new-street-default' || !this.state.selectedNewStreetType}
                  onChange={this.onChangeNewStreetType}
                  onClick={onNewStreetDefaultClick}
                />
                <label htmlFor='new-street-default' data-i18n='dialogs.new-street.default'>
                  Start with an example street
                </label>
              </li>
              <li>
                <input
                  type='radio'
                  name='new-street'
                  id='new-street-empty'
                  checked={this.state.selectedNewStreetType === 'new-street-empty'}
                  onChange={this.onChangeNewStreetType}
                  onClick={onNewStreetEmptyClick}
                />
                <label htmlFor='new-street-empty' data-i18n='dialogs.new-street.empty'>
                  Start with an empty street
                </label>
              </li>
              {(() => {
                // Display this button only if there is a previous street to copy
                // from that is not the same as the current street
                const settings = getSettings()
                if (settings.priorLastStreetId && settings.priorLastStreetId !== getStreet().id) {
                  return (
                    <li>
                      <input
                        type='radio'
                        name='new-street'
                        id='new-street-last'
                        checked={this.state.selectedNewStreetType === 'new-street-last'}
                        onChange={this.onChangeNewStreetType}
                        onClick={onNewStreetLastClick}
                      />
                      <label htmlFor='new-street-last' data-i18n='dialogs.new-street.last'>
                        Start with a copy of last street
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
        <div className='welcome-panel'>
          <button className='close' onClick={this.hideWelcome}>×</button>
          {welcomeContent}
        </div>
      </div>
    )
  }
}
