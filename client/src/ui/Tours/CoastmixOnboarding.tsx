import { TourTrigger } from './TourTrigger.js'
import { steps } from './coastmix-onboarding.js'

interface CoastmixOnboardingTourProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler
  }>
}

export function CoastmixOnboardingTour({
  children,
}: CoastmixOnboardingTourProps) {
  return <TourTrigger steps={steps}>{children}</TourTrigger>
}
