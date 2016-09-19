import React from 'react'
import EnvironmentBadge from './EnvironmentBadge'

// import { t } from '../app/locale'
import { debug } from '../preinit/debug_settings'
import { URL_SIGN_IN_REDIRECT } from '../app/routing'
import { onMyStreetsClick } from '../gallery/view'
import { getElAbsolutePos } from '../util/helpers'
import { closestEl } from '../util/dom_helpers'
import Avatar from '../app/Avatar'

export default class MenuBar extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      userId: null
    }

    this.onClickMenuButton = this.onClickMenuButton.bind(this)
    this.updateSignInUI = this.updateSignInUI.bind(this)

    // Listen for sign-in. This updates the sign-in button.
    window.addEventListener('stmx:signed_in', this.updateSignInUI)
  }

  /**
   * Handles clicks on <button> elements which result in a dropdown menu.
   */
  onClickMenuButton (event) {
    // We need to send to the parent component (which handles menus) information
    // about what button was clicked and its position, so that the specified
    // menu can open in the correct place. The clicked button stores `data-name`
    // on its attributes, and position is based on its parent `li` element.
    const buttonEl = closestEl(event.target, 'button')
    const name = buttonEl.dataset.name
    const position = getElAbsolutePos(buttonEl.parentNode)
    this.props.onMenuDropdownClick({ name, position })
  }

  updateSignInUI (event) {
    // Sign-in details are passed in via `event.detail`. If a user is not
    // signed in, the event that calls this will pass an empty object for
    // `event.detail`
    if (event.detail.userId) {
      this.setState({ userId: event.detail.userId })
    }
  }

  render () {
    const userId = this.state.userId
    const myStreetsLink = userId ? `/${userId}` : ''
    const identityMenuVisibilityStyle = userId
      ? {} : { display: 'none' }
    const signInVisibilityStyle = userId
      ? { display: 'none' } : {}

    const SettingsButton = (debug.experimental)
      ? (<li id='settings-menu-item'>
        <button
          data-name='settings'
          data-i18n='menu.item.settings'
          className='menu-attached'
          disabled={false}
          onClick={this.onClickMenuButton}
        >
          Settings
        </button>
      </li>) : null

    // Buttons have `disabled={false}` because
    // Firefox sometimes disables some buttons… unsure why
    // --
    // Note on translations - the {t()} method doesn't re-render when the
    // language changes, so this still uses the `data-i18n` method to pick up
    // on text content changes. Individual menus will re-render with {t()}.
    return (
      <nav className='menu-bar'>
        <ul className='menu-bar-left'>
          <li className='menu-bar-title'>
            <div className='streetmix-logo' />
            <h1>Streetmix</h1>
          </li>
          <li id='help-menu-item'>
            <button
              data-name='help'
              data-i18n='menu.item.help'
              className='menu-attached'
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Help
            </button>
          </li>
          <li id='contact-menu-item'>
            <button
              data-name='contact'
              data-i18n='menu.item.contact'
              className='menu-attached'
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Contact
            </button>
          </li>
        </ul>
        <ul className='menu-bar-right'>
          <li id='identity-menu-item' style={identityMenuVisibilityStyle}>
            <button
              data-name='identity'
              className='menu-attached'
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              <Avatar userId={userId} />
              <span className='user-id'>{userId}</span>
            </button>
          </li>
          <li id='sign-in-menu-item' style={signInVisibilityStyle}>
            <a href={`/${URL_SIGN_IN_REDIRECT}`} className='command' data-i18n='menu.item.sign-in'>
              Sign in
            </a>
          </li>
          <li>
            <a href='/new' target='_blank' data-i18n='menu.item.new-street'>
              New street
            </a>
          </li>
          <li id='gallery-link'>
            <a href={myStreetsLink} data-i18n='menu.item.my-streets' onClick={onMyStreetsClick}>
              My streets
            </a>
          </li>
          {SettingsButton}
          <li id='share-menu-item'>
            <button
              data-name='share'
              data-i18n='menu.item.share'
              className='menu-attached'
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Share
            </button>
          </li>
        </ul>
        <EnvironmentBadge />
      </nav>
    )
  }
}

MenuBar.propTypes = {
  onMenuDropdownClick: React.PropTypes.func
}
