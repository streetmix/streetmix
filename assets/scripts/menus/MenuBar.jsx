/* global mixpanel */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import EnvironmentBadge from './EnvironmentBadge'
import { URL_SIGN_IN_REDIRECT } from '../app/routing'
import { showGallery } from '../gallery/view'
import { getElAbsolutePos } from '../util/helpers'
import Avatar from '../users/Avatar'

class MenuBar extends React.PureComponent {
  static propTypes = {
    onMenuDropdownClick: PropTypes.func,
    userId: PropTypes.string,
    enableLocaleSettings: PropTypes.bool
  }

  static defaultProps = {
    userId: '',
    enableLocaleSettings: false
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
          id="sign-in-link"
        >
          <FormattedMessage id="menu.item.sign-in" defaultMessage="Sign in" />
        </a>
      </li>)

    const SettingsButton = (this.props.enableLocaleSettings)
      ? (<li id="settings-menu-item">
        <button
          data-name="settings"
          className="menu-attached"
          disabled={false}
          onClick={this.onClickMenuButton}
        >
          <FormattedMessage id="menu.item.settings" defaultMessage="Settings" />
        </button>
      </li>) : null

    // Buttons have `disabled={false}` because
    // Firefox sometimes disables some buttons… unsure why
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
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              <FormattedMessage id="menu.item.help" defaultMessage="Help" />
            </button>
          </li>
          <li className="hide-for-no-internet">
            <button
              data-name="contact"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              <FormattedMessage id="menu.item.contact" defaultMessage="Contact" />
            </button>
          </li>
          <li className="hide-for-no-internet">
            <button
              data-name="contribute"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              <FormattedMessage id="menu.item.contribute" defaultMessage="Contribute" />
            </button>
          </li>
        </ul>
        <ul ref={(ref) => { this.menuBarRight = ref }} className="menu-bar-right">
          {UserAvatar}
          <li>
            <a href="/new" target="_blank">
              <FormattedMessage id="menu.item.new-street" defaultMessage="New street" />
            </a>
          </li>
          <li className="hide-for-no-internet">
            <a href={myStreetsLink} onClick={this.onClickMyStreets}>
              <FormattedMessage id="menu.item.my-streets" defaultMessage="My streets" />
            </a>
          </li>
          {SettingsButton}
          <li>
            <button
              data-name="share"
              className="menu-attached"
              disabled={false}
              onClick={this.onClickMenuButton}
            >
              <FormattedMessage id="menu.item.share" defaultMessage="Share" />
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
    userId: state.user.signInData && state.user.signInData.userId,
    enableLocaleSettings: state.flags.LOCALES_LEVEL_1.value || state.flags.LOCALES_LEVEL_2.value || state.flags.LOCALES_LEVEL_3.value
  }
}

export default connect(mapStateToProps)(MenuBar)
