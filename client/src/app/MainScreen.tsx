import { FloatingPanelPortal } from './FloatingPanelPortal.js'
import './FloatingPanelPortal.css'

interface MainScreenProps {
  children: React.ReactNode
}

// The "main screen" houses all of the main UI of Streetmix that does not
// include accilary overlays and banners. All main interactivity of Streetmix
// should be contained within this. We also use this component to set up some
// context providers for portal layers.
export function MainScreen({ children }: MainScreenProps) {
  return (
    <div className="main-screen">
      <FloatingPanelPortal>{children}</FloatingPanelPortal>
    </div>
  )
}
