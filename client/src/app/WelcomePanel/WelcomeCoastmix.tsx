import { useDispatch } from '~/src/store/hooks.js'
import { startTour, stopTour } from '~/src/store/slices/app.js'
import { resetCoastmixState } from '~/src/store/slices/coastmix.js'
import { CoastmixOnboardingTour } from '~/src/ui/Tours/CoastmixOnboarding.js'
import { Button } from '~/src/ui/Button.js'

interface WelcomeCoastmixProps {
  handleDismiss: React.MouseEventHandler
}

export function WelcomeCoastmix({ handleDismiss }: WelcomeCoastmixProps) {
  const dispatch = useDispatch()

  function handleQuickTour(event: React.MouseEvent): void {
    dispatch(resetCoastmixState())
    dispatch(startTour())
    handleDismiss(event)
  }

  function handleSkip(event: React.MouseEvent): void {
    dispatch(stopTour())
    handleDismiss(event)
  }

  return (
    <div className="welcome-panel-content">
      <h1>Welcome to Coastmix!</h1>

      <p style={{ textAlign: 'left' }}>
        Climate change can lead to sea level rise and cause more intense and
        frequent storms along coastlines and waterfronts. Cities must adapt to
        prevent flooding, protecting communities and infrastructure such as
        buildings and roads.
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
