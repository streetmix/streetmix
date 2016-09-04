import React from 'react'
import MenuBar from './MenuBar'
import HelpMenu from './HelpMenu'
import ContactMenu from './ContactMenu'

export default class MenusContainer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      activeMenu: null
    }
  }

  render () {
    return (
      <div>
        <MenuBar />
        <HelpMenu />
        <ContactMenu />
      </div>
    )
  }
}
