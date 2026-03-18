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

  return <button onClick={tour.start}>tutorial 1</button>
}

export function ShepherdTest() {
  return (
    <ShepherdJourneyProvider>
      <div className="tour-test">
        <Button />
      </div>
    </ShepherdJourneyProvider>
  )
}
