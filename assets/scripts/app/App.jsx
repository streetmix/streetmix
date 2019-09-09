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
import StatusMessage from './StatusMessage'
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
          <StatusMessage />
          <NoConnectionMessage />
          <EnvironmentEditor />
          <SegmentDragLayer />
          <StreetView />
          <ToastContainer setMessages={setMessages} />
        </div>
      </DndProvider>
    </IntlProvider>
  )
}

function setMessages (addMessage) {
  const items = [
    {
      message: 'Your street was reloaded from the server as it was modified elsewhere.'
    },
    {
      message: 'The segment has been removed.',
      action: 'Undo'
    },
    {
      type: 'success',
      title: 'Achievement unlocked!',
      message: 'Reach 100,000 people per hour street capacity.',
      action: 'More info'
    },
    {
      type: 'warning',
      message: 'Streetmix is having trouble connecting to the Internet.',
      action: 'Retry connection',
      stay: true
    },
    {
      message: 'Nothing to undo.'
    }
  ]

  items.forEach((item, index) => {
    window.setTimeout(() => {
      addMessage(item)
    }, (index * 1000) + 5000)
  })
}

export default App
