import React from 'react'

import { useSelector } from '~/src/store/hooks'
import Description from './Description'
import Warnings from './Warnings'

import type { BoundaryPosition, Segment } from '@streetmix/types'

interface InfoBubbleLowerProps {
  position: number | BoundaryPosition
  setArrowHighlighted: (v: boolean) => void
}

function InfoBubbleLower ({
  position,
  setArrowHighlighted
}: InfoBubbleLowerProps): React.ReactElement {
  const street = useSelector((state) => state.street)

  // Segment is undefined when position refers to a building
  let segment: Segment | undefined
  if (typeof position === 'number') {
    segment = street.segments[position]
  }

  function handleDescriptionOver (): void {
    setArrowHighlighted(true)
  }

  function handleDescriptionOut (): void {
    setArrowHighlighted(false)
  }

  return (
    <>
      <Warnings segment={segment} />
      {segment?.type !== undefined && (
        <Description
          type={segment.type}
          variantString={segment.variantString}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
        />
      )}
    </>
  )
}

export default InfoBubbleLower
