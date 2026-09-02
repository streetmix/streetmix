import titleImage from 'url:./welcome-coastmix.png'
import { CoastmixOnboardingTour } from '~/src/ui/Tours/CoastmixOnboarding.js'
import { Button } from '~/src/ui/Button.js'
import './WelcomeCoastmix.css'

interface WelcomeCoastmixProps {
  handleDismiss: React.MouseEventHandler
}

export function WelcomeCoastmix({ handleDismiss }: WelcomeCoastmixProps) {
  function handleQuickTour(event: React.MouseEvent): void {
    handleDismiss(event)
  }

  function handleSkip(event: React.MouseEvent): void {
    handleDismiss(event)
  }

  return (
    <div className="welcome-panel-content welcome-coastmix">
      <h1>Welcome to Coastmix!</h1>
      <img
        src={titleImage}
        width="480"
        alt="Welcome to Coastmix!"
        draggable={false}
      />

      <p>
        Climate change is causing sea level rise and more intense and frequent
        storms. Cities must adapt their waterfronts to prevent flooding and
        protect communities, buildings, infrastructure, and open spaces.
      </p>
      <p>
        Coastmix was built in partnership between the{' '}
        <a href="https://boston.gov/" target="_blank" rel="noopener">
          City of Boston
        </a>{' '}
        and the developers of{' '}
        <a href="https://streetmix.net/" target="_blank" rel="noopener">
          Streetmix
        </a>{' '}
        to teach coastal resilience planning, explore ways to prevent flooding,
        and design your own adaptation strategies.{' '}
        <strong>Let’s get started!</strong>
      </p>
      <div className="welcome-panel-buttons">
        <CoastmixOnboardingTour>
          <Button onClick={handleQuickTour} primary>
            Take a quick tour
          </Button>
        </CoastmixOnboardingTour>
        <Button onClick={handleSkip} tertiary>
          Skip
        </Button>
      </div>
    </div>
  )
}
