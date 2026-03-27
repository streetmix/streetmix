import { useSelector } from '~/src/store/hooks.js'
import { DescriptionPrompt } from './DescriptionPrompt.js'
import { Warnings } from './Warnings.js'

import type { BoundaryPosition, Segment } from '@streetmix/types'

interface PopupLowerProps {
  position: number | BoundaryPosition
  setArrowHighlighted: (v: boolean) => void
}

export function PopupLower({ position, setArrowHighlighted }: PopupLowerProps) {
  const street = useSelector((state) => state.street)

  // Segment is undefined when position refers to a building
  let segment: Segment | undefined
  if (typeof position === 'number') {
    segment = street.segments[position]
  }

  function handleDescriptionOver(): void {
    setArrowHighlighted(true)
  }

  function handleDescriptionOut(): void {
    setArrowHighlighted(false)
  }

  return (
    <>
      <Warnings segment={segment} />
      {segment?.type !== undefined && (
        <DescriptionPrompt
          type={segment.type}
          variantString={segment.variantString}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
        />
      )}
    </>
  )
}
