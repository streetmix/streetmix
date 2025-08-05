import React, { useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { DirectionProvider, type Direction } from '@radix-ui/react-direction'
import { DndProvider } from 'react-dnd-multi-backend'
import { HTML5toTouch } from 'rdndmb-html5-to-touch'
import { FloatingTree } from '@floating-ui/react'

import MenusContainer from '../menubar/MenusContainer'
import StreetNameplateContainer from '../streets/StreetNameplateContainer'
import DescriptionPanel from '../info_bubble/DescriptionPanel'
import PaletteContainer from '../palette/PaletteContainer'
import DialogRoot from '../dialogs/DialogRoot'
import SkyPicker from '../sky/SkyPicker'
import Gallery from '../gallery/Gallery'
import SegmentDragLayer from '../segments/SegmentDragLayer'
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

    init()
  }, [])

  // Set color mode on top level DOM element
  useEffect(() => {
    document.querySelector('html')!.dataset.colorMode = colorMode
  }, [colorMode])

  return (
    <>
      <Loading isLoading={isLoading || !everythingLoaded} />
      {!isLoading && everythingLoaded && (
        <FloatingTree>
          <DirectionProvider dir={dir}>
            <IntlProvider
              locale={locale.locale}
              key={locale.locale}
              messages={locale.messages}
            >
              {/* The prop context={window} prevents crash errors with hot-module reloading */}
              <DndProvider options={HTML5toTouch} context={window}>
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
                  <DescriptionPanel />
                  <WelcomePanel />
                  <PaletteContainer />
                  <SkyPicker />
                  <SegmentDragLayer />
                  <StreetView />
                  <ToastContainer />
                  <SentimentSurveyContainer />
                </div>
                <SponsorBanner />
              </DndProvider>
            </IntlProvider>
          </DirectionProvider>
        </FloatingTree>
      )}
    </>
  )
}

export default App
