import { useShepherd } from 'react-shepherd'

import { useDispatch } from '~src/store/hooks.js'
import { resetCoastmixState } from '~/src/store/slices/coastmix.js'
import { startTour } from '~/src/store/slices/app.js'
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
  const dispatch = useDispatch()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps1,
  })

  function handleClick() {
    dispatch(resetCoastmixState())
    dispatch(startTour())
    tour.start()
  }

  return <button onClick={handleClick}>tutorial 1</button>
}

function Button2() {
  const Shepherd = useShepherd()
  const dispatch = useDispatch()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps2,
  })

  function handleClick() {
    dispatch(resetCoastmixState())
    dispatch(startTour())
    tour.start()
  }

  return <button onClick={handleClick}>tutorial 2</button>
}

export function ShepherdTest() {
  return (
    <div className="tour-test">
      <Button1 />
      <Button2 />
    </div>
  )
}
