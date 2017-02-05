import React from 'react'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import WelcomePanel from './WelcomePanel'
import Palette from './Palette'

export default class App extends React.PureComponent {
  render () {
    return (
      <div>
        <MenusContainer />
        <StreetNameCanvas />
        <WelcomePanel />
        <Palette />
      </div>
    )
  }
}
