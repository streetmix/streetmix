import { useDispatch } from '~src/store/hooks.js'
import { resetCoastmixState } from '~/src/store/slices/coastmix.js'

import { CoastmixOnboardingTour } from './CoastmixOnboarding.js'
import { CoastmixPracticeTour } from './CoastmixPractice.js'

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
        <button onClick={reset}>tutorial 2</button>
      </CoastmixPracticeTour>
    </div>
  )
}
