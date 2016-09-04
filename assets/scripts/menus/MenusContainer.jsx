import React from 'react'
import ReactDOM from 'react-dom'
import HelpMenu from './HelpMenu'

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
        <HelpMenu />
      </div>
    )
  }
}
