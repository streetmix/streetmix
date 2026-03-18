import { useShepherd } from 'react-shepherd'

import { Button } from '~/src/ui/Button.js'
import { useDispatch } from '~/src/store/hooks.js'
import { nextTutorialStep, skipTutorial } from '~/src/store/slices/app.js'
import { steps } from '~/src/ui/tours/coastmix-onboarding.js'

interface WelcomeCoastmixProps {
  handleDismiss: React.MouseEventHandler
}

const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
  },
  useModalOverlay: true,
}

export function WelcomeCoastmix({ handleDismiss }: WelcomeCoastmixProps) {
  const dispatch = useDispatch()

  const Shepherd = useShepherd()
  const tour = new Shepherd.Tour({
    ...tourOptions,
    steps: steps,
  })

  function handleQuickTour(): void {
    tour.start()
    dispatch(nextTutorialStep())
  }

  function handleSkip(event: React.MouseEvent): void {
    dispatch(skipTutorial())
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
        <Button onClick={handleQuickTour} primary>
          Take a quick tour
        </Button>
        <Button onClick={handleSkip} tertiary>
          Skip
        </Button>
      </div>
    </div>
  )
}
