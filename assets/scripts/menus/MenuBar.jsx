/* global mixpanel */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EnvironmentBadge from './EnvironmentBadge'

// import { t } from '../app/locale'
import { debug } from '../preinit/debug_settings'
import { URL_SIGN_IN_REDIRECT } from '../app/routing'
import { showGallery } from '../gallery/view'
import { getElAbsolutePos } from '../util/helpers'
import Avatar from '../app/Avatar'

class MenuBar extends React.PureComponent {
  static propTypes = {
    onMenuDropdownClick: PropTypes.func,
    userId: PropTypes.string
  }

  static defaultProps = {
    userId: ''
  }

  constructor (props) {
    super(props)

    window.addEventListener('resize', this.onResize)

    // StreetNameCanvas needs to know the left position of the right menu bar when it's mounted
    window.addEventListener('stmx:streetnamecanvas_mounted', this.onResize)
  }

  componentDidMount () {
    this.attachSignInTracking()
  }

  componentDidUpdate (prevProps) {
    if (this.props.userId && !prevProps.userId) {
      this.attachSignInTracking()
    }
  }

  /**
   * Attaches mixpanel tracking to sign-in link, if element is present. Call
   * only after DOM is rendered.
   */
  attachSignInTracking () {
    if (window.mixpanel && document.getElementById('sign-in-link')) {
      mixpanel.track_links('#sign-in-link', 'clicked sign in link', {
        referrer: document.referrer
      })
    }
  }

  /**
   * Handles clicks on <button> elements which result in a dropdown menu.
   */
  onClickMenuButton = (event) => {
    // We need to send to the parent component (which handles menus) information
    // about what button was clicked and its position, so that the specified
    // menu can open in the correct place. The clicked button stores `data-name`
    // on its attributes, and position is based on its parent `li` element.
    const buttonEl = event.target.closest('button')
    const name = buttonEl.dataset.name
    const position = getElAbsolutePos(buttonEl.parentNode)
    this.props.onMenuDropdownClick({ name, position })
  }

  onClickMyStreets = (event) => {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return
    }

    if (this.props.userId) {
      showGallery(this.props.userId, false)
    } else {
      showGallery(null, false, true)
    }
  }

  onResize = () => {
    // Throw this event so that the StreetName can figure out if it needs to push itself lower than the menubar
    window.dispatchEvent(new CustomEvent('stmx:menu_bar_resized', { detail: {
      rightMenuBarLeftPos: this.menuBarRight.getBoundingClientRect().left
    }}))
  }

  render () {
    const userId = this.props.userId
    const myStreetsLink = userId ? `/${userId}` : ''

    const UserAvatar = (userId)
      ? (<li className="hide-for-no-internet">
        <button
          data-name="identity"
          className="menu-attached"
          disabled={false}
          onClick={this.onClickMenuButton}
        >
          <Avatar userId={userId} />
          <span className="user-id">{userId}</span>
        </button>
      </li>) : (<li className="hide-for-no-internet">
        <a
          href={`/${URL_SIGN_IN_REDIRECT}`}
          className="command"
          data-i18n="menu.item.sign-in"
          id="sign-in-link"
        >
          Sign in
        </a>
      </li>)

    const SettingsButton = (debug.experimental)
      ? (<li id="settings-menu-item">
        <button
          data-name="settings"
          data-i18n="menu.item.settings"
          className="menu-attached"
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
      <nav className="menu-bar">
        <ul className="menu-bar-left">
          <li className="menu-bar-title">
            <div className="streetmix-logo" />
            <h1>Streetmix</h1>
          </li>
          <li id="help-menu-item">
            <button
              data-name="help"
              data-i18n="menu.item.help"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Help
            </button>
          </li>
          <li className="hide-for-no-internet">
            <button
              data-name="contact"
              data-i18n="menu.item.contact"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Contact
            </button>
          </li>
          <li className="hide-for-no-internet">
            <button
              data-name="contribute"
              data-i18n="menu.item.contribute"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              Contribute
            </button>
          </li>
        </ul>
        <ul ref={(ref) => { this.menuBarRight = ref }} className="menu-bar-right">
          {UserAvatar}
          <li>
            <a href="/new" target="_blank" data-i18n="menu.item.new-street">
              New street
            </a>
          </li>
          <li className="hide-for-no-internet">
            <a href={myStreetsLink} data-i18n="menu.item.my-streets" onClick={this.onClickMyStreets}>
              My streets
            </a>
          </li>
          {SettingsButton}
          <li>
            <button
              data-name="share"
              data-i18n="menu.item.share"
              className="menu-attached"
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

function mapStateToProps (state) {
  return {
    userId: state.user.signInData && state.user.signInData.userId
  }
}

export default connect(mapStateToProps)(MenuBar)
