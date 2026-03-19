import { CoastmixOnboardingTour } from './CoastmixOnboarding.js'
import { CoastmixPracticeTour } from './CoastmixPractice.js'

export function ShepherdTest() {
  return (
    <div className="tour-test">
      <CoastmixOnboardingTour>
        <button>tutorial 1</button>
      </CoastmixOnboardingTour>
      <CoastmixPracticeTour>
        <button>tutorial 2</button>
      </CoastmixPracticeTour>
    </div>
  )
}
