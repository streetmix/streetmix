import { cloneElement } from 'react'
import { useShepherd } from 'react-shepherd'

import { useDispatch } from '~src/store/hooks.js'
import { resetCoastmixState } from '~/src/store/slices/coastmix.js'
import { startTour } from '~/src/store/slices/app.js'

import type { StepOptions } from 'shepherd.js'

export const tourOptions = {
  defaultStepOptions: {
    cancelIcon: {
      enabled: false,
    },
  },
  useModalOverlay: true,
}

interface TourTriggerProps {
  children: React.ReactElement<{
    onClick?: React.MouseEventHandler
  }>
  steps: StepOptions[]
}

/**
 * Wraps a child element (usually a <button> or the <Button> UI component)
 * which triggers a tour with the given `steps` object. Optionally runs
 * the child's onClick handler, if provided, in addition to this component's
 * own onClick handler.
 */
export function TourTrigger({ children, steps }: TourTriggerProps) {
  const dispatch = useDispatch()
  const Shepherd = useShepherd()

  function handleClick(event: React.MouseEvent): void {
    const tour = new Shepherd.Tour({
      ...tourOptions,
    })

    // This is so we could theoretically dynamically generate the steps
    // based on state, etc.
    tour.addSteps(steps)

    dispatch(resetCoastmixState())
    dispatch(startTour())
    tour.start()

    if (typeof children.props.onClick === 'function') {
      children.props.onClick(event)
    }
  }

  return cloneElement(children, {
    onClick: handleClick,
  })
}
