import React from 'react'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import WelcomePanel from './WelcomePanel'
import Palette from './Palette'
import DialogRoot from '../dialogs/DialogRoot'
import StatusMessage from './StatusMessage'
import Flash from './Flash'
import DebugInfo from './DebugInfo'

export default class App extends React.PureComponent {
  render () {
    return (
      <div>
        <div className='main-screen'>
          <MenusContainer />
          <StreetNameCanvas />
          <WelcomePanel />
          <Palette />
          <DialogRoot />
          <StatusMessage />
        </div>

        <Flash />
        <DebugInfo />
      </div>
    )
  }
}
