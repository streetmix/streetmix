import React, { useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { DndProvider } from 'react-dnd'
import { DirectionProvider, type Direction } from '@radix-ui/react-direction'
import MultiBackend from 'react-dnd-multi-backend'
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch'
import MenusContainer from '../menus/MenusContainer'
import StreetNameplateContainer from '../streets/StreetNameplateContainer'
import InfoBubble from '../info_bubble/InfoBubble'
import PaletteContainer from '../palette/PaletteContainer'
import DialogRoot from '../dialogs/DialogRoot'
import EnvironmentEditor from '../streets/EnvironmentEditor'
import Gallery from '../gallery/Gallery'
import SegmentDragLayer from '../segments/SegmentDragLayer'
import DebugHoverPolygon from '../info_bubble/DebugHoverPolygon'
import ToastContainer from '../ui/Toasts'
import SentimentSurveyContainer from '../sentiment/SentimentSurveyContainer'
import { useSelector } from '../store/hooks'
import DebugInfo from './DebugInfo'
import BlockingShield from './BlockingShield'
import BlockingError from './BlockingError'
import StreetView from './StreetView'
import PrintContainer from './PrintContainer'
import WelcomePanel from './WelcomePanel'
import NotificationBar from './NotificationBar'
import { setStreetSectionTop } from './window_resize'
import Loading from './Loading'
import SponsorBanner from './SponsorBanner'

function App (): React.ReactElement {
  const [isLoading, setLoading] = useState(true)
  const locale = useSelector((state) => state.locale)
  const dir: Direction = useSelector(
    (state) => state.app.contentDirection as Direction
  ) // TODO use real type
  const everythingLoaded = useSelector((state) => state.app.everythingLoaded)
  const colorMode = useSelector((state) => state.settings.colorMode)

  // TODO: Move other initialization methods here.
  useEffect(() => {
    const init = async (): Promise<void> => {
      // Holding spot for other init functions, currently empty

      // Turn off loading after initial loading is done
      setLoading(false)
    }

    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After loading, do ancient DOM stuff
  useEffect(() => {
    if (!isLoading && everythingLoaded) {
      setStreetSectionTop()
    }
  }, [isLoading, everythingLoaded])

  // Set color mode on top level DOM element
  useEffect(() => {
    // Element is guaranteed to exist
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    document.querySelector('html')!.dataset.colorMode = colorMode
  }, [colorMode])

  return (
    <>
      <Loading isLoading={isLoading || !everythingLoaded} />
      {!isLoading && everythingLoaded && (
        <DirectionProvider dir={dir}>
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
              <NotificationBar />
              <BlockingShield />
              <BlockingError />
              <Gallery />
              <DialogRoot />
              <DebugInfo />
              <PrintContainer />
              <div className="main-screen">
                <MenusContainer />
                <StreetNameplateContainer />
                <InfoBubble />
                <DebugHoverPolygon />
                <WelcomePanel />
                <PaletteContainer />
                <EnvironmentEditor />
                <SegmentDragLayer />
                <StreetView />
                <ToastContainer />
                <SentimentSurveyContainer />
              </div>
              <SponsorBanner />
            </DndProvider>
          </IntlProvider>
        </DirectionProvider>
      )}
    </>
  )
}

export default App
