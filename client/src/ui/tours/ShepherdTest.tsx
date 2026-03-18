import { ShepherdJourneyProvider, useShepherd } from 'react-shepherd'

import { steps } from './coastmix-onboarding.js'
import './shepherd.css'

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
  },
  useModalOverlay: true,
}

function Button() {
  const Shepherd = useShepherd()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps,
  })

  return (
    <button
      className="test-shepherd-button"
      onClick={tour.start}
      style={{
        zIndex: 1000,
        position: 'absolute',
        backgroundColor: '#fff',
        padding: '10px',
      }}
    >
      Start Tour
    </button>
  )
}

export function ShepherdTest() {
  return (
    <ShepherdJourneyProvider>
      <Button />
    </ShepherdJourneyProvider>
  )
}
