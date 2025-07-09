import React, { useState } from 'react'

import { useSelector } from '~/src/store/hooks'
import Triangle from './Triangle'
import Description from './Description'
import Warnings from './Warnings'

import type { BoundaryPosition, Segment } from '@streetmix/types'

interface InfoBubbleLowerProps {
  position: number | BoundaryPosition
  updateBubbleDimensions: () => void
  infoBubbleEl: HTMLDivElement
  updateHoverPolygon: () => void
}

function InfoBubbleLower ({
  position,
  updateBubbleDimensions,
  infoBubbleEl,
  updateHoverPolygon
}: InfoBubbleLowerProps): React.ReactElement {
  const [isTriangleHighlighted, setTriangleHighlighted] = useState(false)
  const street = useSelector((state) => state.street)

  // Segment is undefined when position refers to a building
  let segment: Segment | undefined
  if (typeof position === 'number') {
    segment = street.segments[position]
  }

  function handleDescriptionOver (): void {
    setTriangleHighlighted(true)
  }

  function handleDescriptionOut (): void {
    setTriangleHighlighted(false)
  }

  return (
    <>
      <Warnings segment={segment} />
      {/* <Triangle highlight={isTriangleHighlighted} />
      {segment?.type !== undefined && (
        <Description
          type={segment.type}
          variantString={segment.variantString}
          updateBubbleDimensions={updateBubbleDimensions}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
          infoBubbleEl={infoBubbleEl}
          updateHoverPolygon={updateHoverPolygon}
        />
      )} */}
    </>
  )
}

export default InfoBubbleLower
