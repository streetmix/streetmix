import { ShepherdJourneyProvider } from 'react-shepherd'

import './shepherd.css'

interface TourProviderProps {
  children: React.ReactNode
}

/**
 * Wrap application with this so that any child component can trigger a tour.
 * Also injects tour element stylesheets.
 */
export function TourProvider({ children }: TourProviderProps) {
  return <ShepherdJourneyProvider>{children}</ShepherdJourneyProvider>
}
