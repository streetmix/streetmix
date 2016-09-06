import React from 'react'
import MenuBar from './MenuBar'
import HelpMenu from './HelpMenu'
import ContactMenu from './ContactMenu'
import IdentityMenu from './IdentityMenu'
import SettingsMenu from './SettingsMenu'
import ShareMenu from './ShareMenu'

export default class MenusContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeMenu: null,
      activeMenuPos: null
    }

    this.onMenuDropdownClick = this.onMenuDropdownClick.bind(this)
  }

  /**
   * Callback function passed to the MenuBar component.
   * Clicked buttons that have a menu component will report back to this component
   * what was clicked and where it should be placed, which is then passed to
   * individual menus.
   */
  onMenuDropdownClick (clickedItem) {
    // If the clicked menu is already active, it's toggled off.
    const activeMenu = this.state.activeMenu === clickedItem.name ? null : clickedItem.name
    this.setState({
      activeMenu: activeMenu,
      activeMenuPos: activeMenu ? clickedItem.position : [0]
    })
  }

  render () {
    const { activeMenu, activeMenuPos } = this.state

    return (
      <div>
        <MenuBar onMenuDropdownClick={this.onMenuDropdownClick} />
        <HelpMenu isActive={activeMenu === 'help'} position={activeMenuPos} />
        <ContactMenu isActive={activeMenu === 'contact'} position={activeMenuPos} />
        <IdentityMenu isActive={activeMenu === 'identity'} position={activeMenuPos} />
        <SettingsMenu isActive={activeMenu === 'settings'} position={activeMenuPos} />
        <ShareMenu isActive={activeMenu === 'share'} position={activeMenuPos} />
      </div>
    )
  }
}
