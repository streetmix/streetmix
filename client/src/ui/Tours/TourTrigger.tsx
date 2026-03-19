import { cloneElement } from 'react'
import { useShepherd } from 'react-shepherd'

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
  steps: StepOptions[] | (() => StepOptions[])
}

/**
 * Wraps a child element (usually a <button> or the <Button> UI component)
 * which triggers a tour with the given `steps` object. Optionally runs
 * the child's onClick handler, if provided, in addition to this component's
 * own onClick handler.
 */
export function TourTrigger({ children, steps }: TourTriggerProps) {
  const Shepherd = useShepherd()

  function handleClick(event: React.MouseEvent): void {
    const tour = new Shepherd.Tour({
      ...tourOptions,
    })

    // Steps may be dynamically generated based on state, etc. when
    // called as a function
    if (typeof steps === 'function') {
      tour.addSteps(steps())
    } else {
      tour.addSteps(steps)
    }

    if (typeof children.props.onClick === 'function') {
      children.props.onClick(event)
    }

    tour.start()
  }

  return cloneElement(children, {
    onClick: handleClick,
  })
}
