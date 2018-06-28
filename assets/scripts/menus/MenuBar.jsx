import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EnvironmentBadge from './EnvironmentBadge'
import { goTwitterSignIn } from '../app/routing'
import { showGallery } from '../gallery/view'
import MenuBarItem from './MenuBarItem'
import Avatar from '../users/Avatar'
import { clearMenus } from '../store/actions/menus'
import { showDialog } from '../store/actions/dialogs'

class MenuBar extends React.PureComponent {
  static propTypes = {
    onMenuDropdownClick: PropTypes.func,
    userId: PropTypes.string,
    clearMenus: PropTypes.func,
    showDialog: PropTypes.func
  }

  static defaultProps = {
    userId: ''
  }

  componentDidMount () {
    window.addEventListener('resize', this.onResize)

    // StreetNameCanvas needs to know the left position of the right menu bar when it's mounted
    window.addEventListener('stmx:streetnamecanvas_mounted', this.onResize)

    // Currently, when locales are refreshed, this remounts the entire app, including
    // this component. This "resets" all menus to its closed state, but it's still "active"
    // in Redux. Call this as soon as component mounts to make sure menu state is reset.
    this.props.clearMenus()
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
        <MenuBarItem label="Sign in" translation="menu.item.signin" onClick={this.props.showDialog} requireInternet />
      )
  }

  render () {
    const userId = this.props.userId
    const myStreetsLink = userId ? `/${userId}` : ''

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
          <MenuBarItem label="Settings" translation="menu.item.settings" onClick={this.onClickMenuButton('settings')} />
          <MenuBarItem label="Share" translation="menu.item.share" onClick={this.onClickMenuButton('share')} />
          {this.renderUserAvatar(userId)}
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

function mapDispatchToProps (dispatch) {
  return {
    clearMenus: () => dispatch(clearMenus()),
    showDialog: () => dispatch(showDialog('SIGN_IN'))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuBar)
