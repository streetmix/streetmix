import { useShepherd } from 'react-shepherd'

import { steps as steps1 } from './coastmix-onboarding.js'
import { steps as steps2 } from './coastmix-practice.js'

import './shepherd.css'

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
  },
  useModalOverlay: true,
}

function Button1() {
  const Shepherd = useShepherd()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps1,
  })

  return <button onClick={tour.start}>tutorial 1</button>
}

function Button2() {
  const Shepherd = useShepherd()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps2,
  })

  return <button onClick={tour.start}>tutorial 2</button>
}

export function ShepherdTest() {
  return (
    <div className="tour-test">
      <Button1 />
      <Button2 />
    </div>
  )
}
