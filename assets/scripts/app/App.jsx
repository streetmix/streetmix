import React from 'react'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import WelcomePanel from './WelcomePanel'
import Palette from './Palette'
import DialogRoot from '../dialogs/DialogRoot'
import StatusMessage from './StatusMessage'
import NoConnectionMessage from './NoConnectionMessage'
import Flash from './Flash'
import DebugInfo from './DebugInfo'
import Gallery from '../gallery/Gallery'
import BlockingError from './BlockingError'
import MiscHTMLStuff from './MiscHTMLStuff'
import PrintContainer from './PrintContainer'

export default class App extends React.PureComponent {
  render () {
    return (
      <div>
        <BlockingError />
        <Gallery />
        <div className="main-screen">
          <MenusContainer />
          <StreetNameCanvas />
          <WelcomePanel />
          <Palette />
          <DialogRoot />
          <MiscHTMLStuff />
          <StatusMessage />
          <NoConnectionMessage />
        </div>

        <Flash />
        <DebugInfo />
        <PrintContainer />
      </div>
    )
  }
}
