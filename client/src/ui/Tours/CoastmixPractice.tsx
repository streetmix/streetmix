import { TourTrigger } from './TourTrigger.js'
import { steps } from './coastmix-practice.js'

interface CoastmixPracticeTourProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler
  }>
}

export function CoastmixPracticeTour({ children }: CoastmixPracticeTourProps) {
  return <TourTrigger steps={steps}>{children}</TourTrigger>
}
