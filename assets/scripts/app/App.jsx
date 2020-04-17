import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { IntlProvider } from 'react-intl'
import { DndProvider } from 'react-dnd'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch'
import NOTIFICATION from '../../../app/data/notification.json'
import NotificationBar from './NotificationBar'
import MenusContainer from '../menus/MenusContainer'
import StreetNameplateContainer from '../streets/StreetNameplateContainer'
import InfoBubble from '../info_bubble/InfoBubble'
import WelcomePanel from './WelcomePanel'
import PaletteContainer from '../palette/PaletteContainer'
import DialogRoot from '../dialogs/DialogRoot'
import NoConnectionMessage from './NoConnectionMessage'
import EnvironmentEditor from '../streets/EnvironmentEditor'
import Flash from './Flash'
import DebugInfo from './DebugInfo'
import Gallery from '../gallery/Gallery'
import BlockingShield from './BlockingShield'
import BlockingError from './BlockingError'
import StreetView from './StreetView'
import SegmentDragLayer from '../segments/SegmentDragLayer'
import DebugHoverPolygon from '../info_bubble/DebugHoverPolygon'
import PrintContainer from './PrintContainer'
import ToastContainer from '../ui/Toasts/ToastContainer'
import { onResize } from './window_resize'

function App () {
  const locale = useSelector((state) => state.locale)

  useEffect(() => {
    onResize()
  }, [])

  return (
    <IntlProvider
      locale={locale.locale}
      key={locale.locale}
      messages={locale.messages}
    >
      {/* The prop context={window} prevents crash errors with hot-module reloading */}
      <DndProvider
        backend={MultiBackend}
        options={HTML5toTouch}
        context={window}
      >
        {/* DndProvider allows multiple children; IntlProvider does not */}
        <NotificationBar notification={NOTIFICATION} />
        <BlockingShield />
        <BlockingError />
        <Gallery />
        <Flash />
        <DebugInfo />
        <PrintContainer />
        <div className="main-screen">
          <MenusContainer />
          <StreetNameplateContainer />
          <InfoBubble />
          <DebugHoverPolygon />
          <WelcomePanel />
          <PaletteContainer />
          <DialogRoot />
          <NoConnectionMessage />
          <EnvironmentEditor />
          <SegmentDragLayer />
          <StreetView />
          <ToastContainer />
        </div>
      </DndProvider>
    </IntlProvider>
  )
}

export default App
