import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EnvironmentBadge from './EnvironmentBadge'
import { goTwitterSignIn } from '../app/routing'
import { showGallery } from '../gallery/view'
import MenuBarItem from './MenuBarItem'
import Avatar from '../users/Avatar'

class MenuBar extends React.PureComponent {
  static propTypes = {
    onMenuDropdownClick: PropTypes.func,
    userId: PropTypes.string,
    enableLocaleSettings: PropTypes.bool
  }

  static defaultProps = {
    userId: '',
    enableLocaleSettings: false,
    noInternet: false
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)

    // StreetNameCanvas needs to know the left position of the right menu bar when it's mounted
    window.addEventListener('stmx:streetnamecanvas_mounted', this.onResize)
  }

  componentWillUnmount () {
    // Clean up event listeners
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('stmx:streetnamecanvas_mounted', this.onResize)
  }

  /**
   * Handles clicks on <button> elements which result in a dropdown menu.
   * Pass in the name of this menu, and it returns (curries) a function
   * that handles the event.
   */
  onClickMenuButton = (menu) => {
    return (event) => {
      const position = event.target.closest('button').getBoundingClientRect()
      this.props.onMenuDropdownClick(menu, position)
    }
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

  onClickSignIn = (event) => {
    goTwitterSignIn()
  }

  renderUserAvatar = (userId) => {
    return (userId)
      ? (
        <MenuBarItem onClick={this.onClickMenuButton('identity')} requireInternet>
          <Avatar userId={userId} />
          <span className="user-id">{userId}</span>
        </MenuBarItem>
      ) : (
        <MenuBarItem label="Sign in" translation="menu.item.signin" onClick={this.onClickMenuButton('signin')} requireInternet />
      )
  }

  render () {
    const userId = this.props.userId
    const myStreetsLink = userId ? `/${userId}` : ''

    const SettingsButton = this.props.enableLocaleSettings &&
      <MenuBarItem
        label="Settings"
        translation="menu.item.settings"
        onClick={this.onClickMenuButton('settings')}
      />

    return (
      <nav className="menu-bar">
        <ul className="menu-bar-left">
          <li className="menu-bar-title">
            <div className="streetmix-logo" />
            <h1>Streetmix</h1>
          </li>
          <MenuBarItem label="Help" translation="menu.item.help" onClick={this.onClickMenuButton('help')} />
          <MenuBarItem label="Contact" translation="menu.item.contact" onClick={this.onClickMenuButton('contact')} requireInternet />
          <MenuBarItem label="Contribute" translation="menu.item.contribute" onClick={this.onClickMenuButton('contribute')} requireInternet />
        </ul>
        <ul className="menu-bar-right" ref={(ref) => { this.menuBarRight = ref }}>
          {this.renderUserAvatar(userId)}
          <MenuBarItem
            label="New street"
            translation="menu.item.new-street"
            url="/new"
            target="_blank"
          />
          <MenuBarItem
            label="My streets"
            translation="menu.item.my-streets"
            url={myStreetsLink}
            onClick={this.onClickMyStreets}
            requireInternet
          />
          {SettingsButton}
          <MenuBarItem label="Share" translation="menu.item.share" onClick={this.onClickMenuButton('share')} />
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
