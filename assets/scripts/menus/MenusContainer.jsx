import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import MenuBar from './MenuBar'
import HelpMenu from './HelpMenu'
import ContactMenu from './ContactMenu'
import ContributeMenu from './ContributeMenu'
import IdentityMenu from './IdentityMenu'
import SettingsMenu from './SettingsMenu'
import ShareMenu from './ShareMenu'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { showMenu, clearMenus } from '../store/actions/menus'
import './MenusContainer.scss'

class MenusContainer extends React.PureComponent {
  static propTypes = {
    showMenu: PropTypes.func.isRequired,
    clearMenus: PropTypes.func.isRequired,
    activeMenu: PropTypes.string
  }

  static defaultProps = {
    activeMenu: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      activeMenuItemNode: null
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    // If menus are being cleared, handle this. Since active menu is a prop, it
    // can be cleared from anywhere, so this handles changes in active menu state.
    // Clear active menu state only if props have changed from an active menu
    // state to a no-menu state, this prevents side effects from running needlessly.
    if (prevState.activeMenuItemNode && !nextProps.activeMenu) {
      return {
        activeMenuItemNode: null
      }
    }

    return null
  }

  componentDidMount () {
    // Hide menus if page loses visibility.
    document.addEventListener('visibilitychange', this.handleVisibilityChange, false)

    // Hide menus if a click occurs outside of a menu or menu button
    document.addEventListener('pointerdown', this.onBodyMouseDown)

    // Set up keypress listener to hide menus if visible
    registerKeypress('esc', this.hideAllMenus)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    // Force document.body to become the active element when there is no longer an active menu.
    if (prevProps.activeMenu && !this.props.activeMenu) {
      document.body.focus()
    }
  }

  componentWillUnmount () {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange, false)
    document.removeEventListener('pointerdown', this.onBodyMouseDown)
    deregisterKeypress('esc', this.hideAllMenus)
  }

  componentDidCatch (error) {
    console.log(error)
  }

  /**
   * Callback function passed to the MenuBar component.
   * Clicked buttons that have a menu component will report back to this component
   * what was clicked and a reference to that element, which is then passed to
   * individual menus.
   *
   * @param {string} menu - name of the menu that was clicked
   * @param {HTMLElement} node - reference to the menu item button, used to position menu
   */
  onMenuDropdownClick = (menu, node) => {
    // If the clicked menu is already active, it's toggled off.
    const activeMenu = (this.props.activeMenu === menu) ? null : menu
    this.setState({
      activeMenuItemNode: activeMenu ? node : null
    })
    this.props.showMenu(activeMenu)
  }

  /**
   * This event handler callback will close menus if a click occurs outside
   * of a menu or a menu button.
   */
  onBodyMouseDown = (event) => {
    if (!event.target.closest('.menu, .menu-attached')) {
      this.props.clearMenus()
    }
  }

  handleVisibilityChange = () => {
    if (document.hidden === true) {
      this.hideAllMenus()
    }
  }

  hideAllMenus = () => {
    // Only act if there is currently an active menu.
    if (this.props.activeMenu) {
      this.props.clearMenus()
    }
  }

  render () {
    const { activeMenu } = this.props
    const { activeMenuItemNode } = this.state

    return (
      <>
        <MenuBar onMenuDropdownClick={this.onMenuDropdownClick} />
        {/* Menus exist on a different z-index layer from the menu bar */}
        <div className="menus-container">
          <HelpMenu isActive={activeMenu === 'help'} menuItemNode={activeMenuItemNode} />
          <ContactMenu isActive={activeMenu === 'contact'} menuItemNode={activeMenuItemNode} />
          <ContributeMenu isActive={activeMenu === 'contribute'} menuItemNode={activeMenuItemNode} />
          <SettingsMenu isActive={activeMenu === 'settings'} menuItemNode={activeMenuItemNode} />
          <ShareMenu isActive={activeMenu === 'share'} menuItemNode={activeMenuItemNode} />
          <IdentityMenu isActive={activeMenu === 'identity'} menuItemNode={activeMenuItemNode} alignOpposite />
        </div>
      </>
    )
  }
}

function mapStateToProps (state) {
  return {
    activeMenu: state.menus.activeMenu
  }
}

const mapDispatchToProps = {
  showMenu,
  clearMenus
}

export default connect(mapStateToProps, mapDispatchToProps)(MenusContainer)
