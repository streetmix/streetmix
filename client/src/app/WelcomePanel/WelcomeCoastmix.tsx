import { CoastmixOnboardingTour } from '~/src/ui/Tours/CoastmixOnboarding.js'
import { Button } from '~/src/ui/Button.js'

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
    <div className="welcome-panel-content">
      <h1>Welcome to Coastmix!</h1>

      <p style={{ textAlign: 'left' }}>
        Climate change is causing sea level rise and more intense and frequent
        storms. Cities must adapt their waterfronts to prevent flooding and
        protect communities, buildings, infrastructure, and open spaces.
      </p>
      <p style={{ textAlign: 'left' }}>
        Learn about coastal resilience planning, explore ways to prevent
        flooding, and design your own adaptation strategies.{' '}
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
