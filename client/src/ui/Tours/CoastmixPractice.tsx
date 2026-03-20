import { TourTrigger } from './TourTrigger.js'
import { steps, steps2 } from './coastmix-practice.js'

interface CoastmixPracticeTourProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler
  }>
}

export function CoastmixPracticeTour({ children }: CoastmixPracticeTourProps) {
  return <TourTrigger steps={steps}>{children}</TourTrigger>
}

export function CoastmixPracticeTour2({ children }: CoastmixPracticeTourProps) {
  return <TourTrigger steps={steps2}>{children}</TourTrigger>
}
