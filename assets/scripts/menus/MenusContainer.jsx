import React from 'react'
import { connect } from 'react-redux'
import MenuBar from './MenuBar'
import HelpMenu from './HelpMenu'
import ContactMenu from './ContactMenu'
import ContributeMenu from './ContributeMenu'
import IdentityMenu from './IdentityMenu'
import SettingsMenu from './SettingsMenu'
import ShareMenu from './ShareMenu'
import { registerKeypress } from '../app/keypress'
import { showMenu, clearMenus } from '../store/actions/menus'

class MenusContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeMenuPos: [0, 0]
    }

    this.onMenuDropdownClick = this.onMenuDropdownClick.bind(this)
    this.handleMenuClear = this.handleMenuClear.bind(this)
    this.hideAllMenus = this.hideAllMenus.bind(this)
  }

  componentDidMount () {
    // Hide menus if page loses visibility.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden === true) {
        this.hideAllMenus()
      }
    }, false)

    // Set up keypress listener to hide menus if visible
    registerKeypress('esc', this.hideAllMenus)
  }

  componentWillReceiveProps (nextProps) {
    // If menus are being cleared, handle this. Since active menu is a prop, it
    // can be cleared from anywhere, so this handles changes in active menu state.
    // Only call `handleMenuClear` if props have changed from an active menu
    // state to a no-menu state, this prevents side effects from running needlessly.
    if (this.props.activeMenu && !nextProps.activeMenu) {
      this.handleMenuClear()
    }
  }

  /**
   * Callback function passed to the MenuBar component.
   * Clicked buttons that have a menu component will report back to this component
   * what was clicked and where it should be placed, which is then passed to
   * individual menus.
   */
  onMenuDropdownClick (clickedItem) {
    // If the clicked menu is already active, it's toggled off.
    const activeMenu = (this.props.activeMenu === clickedItem.name) ? null : clickedItem.name
    this.setState({
      activeMenuPos: activeMenu ? clickedItem.position : [0, 0]
    })
    this.props.dispatch(showMenu(activeMenu))
  }

  /**
   * Handles component state and DOM changes when menus are cleared. Called from
   * `componentWillReceiveProps()` which will check if props have actually changed.
   */
  handleMenuClear () {
    this.setState({
      activeMenuPos: [0, 0]
    })

    // Force document.body to become the active element.
    // NOTE: prop change check is performed in `componentWillReceiveProps()`
    // because we do not want to re-focus needlessly on document.body if there
    // were no menus to hide.
    document.body.focus()
  }

  hideAllMenus () {
    // Only act if there is currently an active menu.
    if (this.props.activeMenu) {
      this.props.dispatch(clearMenus())
    }
  }

  render () {
    const { activeMenu } = this.props
    const { activeMenuPos } = this.state

    return (
      <div>
        <MenuBar onMenuDropdownClick={this.onMenuDropdownClick} />
        <HelpMenu isActive={activeMenu === 'help'} position={activeMenuPos} />
        <ContactMenu isActive={activeMenu === 'contact'} position={activeMenuPos} />
        <ContributeMenu isActive={activeMenu === 'contribute'} position={activeMenuPos} />
        <IdentityMenu isActive={activeMenu === 'identity'} position={activeMenuPos} />
        <SettingsMenu isActive={activeMenu === 'settings'} position={activeMenuPos} />
        <ShareMenu isActive={activeMenu === 'share'} position={activeMenuPos} />
      </div>
    )
  }
}

MenusContainer.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  activeMenu: React.PropTypes.string
}

MenusContainer.defaultProps = {
  activeMenu: ''
}

function mapStateToProps (state) {
  return {
    activeMenu: state.menus.activeMenu
  }
}

export default connect(mapStateToProps)(MenusContainer)
