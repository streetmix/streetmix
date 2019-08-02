import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import EnvironmentBadge from './EnvironmentBadge'
import MenuBarItem from './MenuBarItem'
import SignInButton from './SignInButton'
import AvatarMenu from './AvatarMenu'
import { doSignIn } from '../users/authentication'
import { clearMenus } from '../store/actions/menus'
import { showDialog } from '../store/actions/dialogs'
import './MenuBar.scss'

class MenuBar extends React.Component {
  static propTypes = {
    onMenuDropdownClick: PropTypes.func,
    user: PropTypes.object,
    clearMenus: PropTypes.func,
    showDialog: PropTypes.func,
    noInternet: PropTypes.bool,
    upgradeFunnel: PropTypes.bool
  }

  static defaultProps = {
    upgradeFunnel: false
  }

  componentDidMount () {
    window.addEventListener('resize', this.handleWindowResize)

    // StreetNameCanvas needs to know the left position of the right menu bar when it's mounted
    window.addEventListener('stmx:streetnamecanvas_mounted', this.handleWindowResize)

    // Currently, when locales are refreshed, this remounts the entire app, including
    // this component. This "resets" all menus to its closed state, but it's still "active"
    // in Redux. Call this as soon as component mounts to make sure menu state is reset.
    this.props.clearMenus()
  }

  componentWillUnmount () {
    // Clean up event listeners
    window.removeEventListener('resize', this.handleWindowResize)
    window.removeEventListener('stmx:streetnamecanvas_mounted', this.handleWindowResize)
  }

  /**
   * Handles clicks on <button> elements which result in a dropdown menu.
   * Pass in the name of this menu, and it returns (curries) a function
   * that handles the event.
   */
  handleClickMenuButton = (menu) => {
    return (event) => {
      const el = event.target.closest('button')
      this.props.onMenuDropdownClick(menu, el)
    }
  }

  handleClickUpgrade = (event) => {
    event.preventDefault()
    this.props.showDialog('UPGRADE')
  }

  handleWindowResize = () => {
    // Throw this event so that the StreetName can figure out if it needs to push itself lower than the menubar
    window.dispatchEvent(new CustomEvent('stmx:menu_bar_resized', { detail: {
      rightMenuBarLeftPos: this.menuBarRight.getBoundingClientRect().left
    } }))
  }

  renderUserAvatar = (user) => {
    return (user)
      ? (
        <li>
          <AvatarMenu user={user} onClick={this.handleClickMenuButton('identity')} />
        </li>
      ) : (
        <li>
          <SignInButton onClick={doSignIn} />
        </li>
      )
  }

  render () {
    const { user } = this.props

    return (
      <nav className="menu-bar">
        <ul className="menu-bar-left">
          <li className="menu-bar-title">
            <div className="streetmix-logo" />
            <h1>Streetmix</h1>
          </li>
          <MenuBarItem label="Help" translation="menu.item.help" onClick={this.handleClickMenuButton('help')} />
          {!this.props.noInternet && (
            <React.Fragment>
              <MenuBarItem label="Contact" translation="menu.item.contact" onClick={this.handleClickMenuButton('contact')} />
              {this.props.upgradeFunnel ? (
                <MenuBarItem url="#" label="Upgrade" translation="menu.upgrade" onClick={this.handleClickUpgrade} />
              ) : (
                <MenuBarItem
                  label="Donate"
                  translation="menu.contribute.donate"
                  url="https://opencollective.com/streetmix/"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </React.Fragment>
          )}
        </ul>
        <ul className="menu-bar-right" ref={(ref) => { this.menuBarRight = ref }}>
          <MenuBarItem
            label="New street"
            translation="menu.item.new-street"
            url="/new"
            target="_blank"
          />
          <MenuBarItem label="Settings" translation="menu.item.settings" onClick={this.handleClickMenuButton('settings')} />
          <MenuBarItem label="Share" translation="menu.item.share" onClick={this.handleClickMenuButton('share')} />
          {!this.props.noInternet && this.renderUserAvatar(user)}
        </ul>
        <EnvironmentBadge />
      </nav>
    )
  }
}

function mapStateToProps (state) {
  return {
    user: (state.user.signInData && state.user.signInData.details) || null,
    noInternet: state.system.noInternet,
    upgradeFunnel: state.flags.BUSINESS_PLAN.value
  }
}

const mapDispatchToProps = {
  clearMenus,
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuBar)
