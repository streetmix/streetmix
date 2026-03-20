import { useDispatch } from '~src/store/hooks.js'
import { resetCoastmixState } from '~/src/store/slices/coastmix.js'

import { CoastmixOnboardingTour } from './CoastmixOnboarding.js'
import {
  CoastmixPracticeTour,
  CoastmixPracticeTour2,
} from './CoastmixPractice.js'

export function ShepherdTest() {
  const dispatch = useDispatch()

  function reset() {
    // Normally we want to reset coastmix state in the steps itself
    // but this is a force-reset for debugging purposes
    dispatch(resetCoastmixState())
  }

  return (
    <div className="tour-test">
      <CoastmixOnboardingTour>
        <button onClick={reset}>tutorial 1</button>
      </CoastmixOnboardingTour>
      <CoastmixPracticeTour>
        <button onClick={reset}>tutorial 2a</button>
      </CoastmixPracticeTour>
      <CoastmixPracticeTour2>
        <button onClick={reset}>tutorial 2b</button>
      </CoastmixPracticeTour2>
    </div>
  )
}
