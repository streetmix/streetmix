import { TourTrigger } from './TourTrigger.js'
import { getSteps } from './coastmix-onboarding.js'

interface CoastmixOnboardingTourProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler
  }>
}

export function CoastmixOnboardingTour({
  children,
}: CoastmixOnboardingTourProps) {
  return <TourTrigger steps={getSteps}>{children}</TourTrigger>
}
