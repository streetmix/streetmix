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
      activeMenu: null
    }
  }

  onMenuDropdownClick (clickedMenu) {
    // We get clickedMenu.name and clickedMenu.position
    // console.log(clickedMenu)
  }

  render () {
    return (
      <div>
        <MenuBar onMenuDropdownClick={this.onMenuDropdownClick} />
        <HelpMenu />
        <ContactMenu />
        <IdentityMenu />
        <SettingsMenu />
        <ShareMenu />
      </div>
    )
  }
}
