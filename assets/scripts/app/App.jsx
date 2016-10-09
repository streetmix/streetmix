import React from 'react'
import { app } from '../preinit/app_settings'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import Palette from './Palette'

export default class App extends React.PureComponent {
  render () {
    return (
      <div>
        <MenusContainer />
        <StreetNameCanvas allowEditing={!app.readOnly} />
        <Palette />
      </div>
    )
  }
}
