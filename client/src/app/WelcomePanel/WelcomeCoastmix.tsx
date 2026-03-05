import { Button } from '~/src/ui/Button'

export function WelcomeCoastmix() {
  function handleQuickTour(): void {
    // TODO
  }

  function handleSkip(): void {
    // TODO
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
      <p style={{ display: 'flex', justifyContent: 'center', gap: '0.5em' }}>
        <Button onClick={handleQuickTour} primary>
          Take a quick tour
        </Button>
        <Button onClick={handleSkip} tertiary>
          Skip
        </Button>
      </p>
    </div>
  )
}
