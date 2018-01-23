import React from 'react'
import MessageBar from './MessageBar'
import MenusContainer from '../menus/MenusContainer'
import StreetNameCanvas from '../streets/StreetNameCanvas'
import InfoBubble from '../info_bubble/InfoBubble'
import WelcomePanel from './WelcomePanel'
import Palette from './Palette'
import DialogRoot from '../dialogs/DialogRoot'
import StatusMessage from './StatusMessage'
import NoConnectionMessage from './NoConnectionMessage'
import Flash from './Flash'
import DebugInfo from './DebugInfo'
import Gallery from '../gallery/Gallery'
import GalleryShield from '../gallery/GalleryShield'
import BlockingError from './BlockingError'
import StreetView from './StreetView'
import DebugHoverPolygon from '../info_bubble/DebugHoverPolygon'
import PrintContainer from './PrintContainer'

export default class App extends React.PureComponent {
  render () {
    return (
      <div className="app-wrapper">
        <BlockingError />
        <Gallery />
        <MessageBar />
        <div className="main-screen">
          <GalleryShield />
          <MenusContainer />
          <StreetNameCanvas />
          <InfoBubble />
          <DebugHoverPolygon />
          <WelcomePanel />
          <Palette />
          <DialogRoot />
          <StreetView />
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
