import { Button } from '~/src/ui/Button'

export function WelcomeCoastmix() {
  function handleQuickTour(): void {
    // TODO
  }

  function handleSkip(): void {
    // TODO
  }

  return (
    <div className="welcome-panel-content first-time-existing-street">
      <h1>Welcome to Coastmix!</h1>

      <p style={{ textAlign: 'left' }}>
        This interactive tool lets you design coastal waterfronts and explore
        ways to prevent flooding. Climate change and global warming are causing
        sea level rise and more intense and frequent coastal storms. Cities
        around the world must adapt their waterfronts to prevent flooding to
        protect communities, infrastructure, buildings, and more. With Coastmix,
        learn about coastal resilience planning and design your own adaptation
        strategies.
      </p>
      <p style={{ textAlign: 'left' }}>Let’s get started!</p>
      <p style={{ textAlign: 'left' }}>
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
