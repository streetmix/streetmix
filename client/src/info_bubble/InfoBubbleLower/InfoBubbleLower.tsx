import React, { useState } from 'react'

import Triangle from './Triangle'
import Description from './Description'
import Warnings from './Warnings'

import type { Segment } from '@streetmix/types'

interface InfoBubbleLowerProps {
  segment: Segment
  updateBubbleDimensions: () => void
  infoBubbleEl: HTMLDivElement
  updateHoverPolygon: () => void
}

function InfoBubbleLower (props: InfoBubbleLowerProps): React.ReactElement {
  const { segment, updateBubbleDimensions, infoBubbleEl, updateHoverPolygon } =
    props

  const [isTriangleHighlighted, setTriangleHighlighted] = useState(false)

  function handleDescriptionOver (): void {
    setTriangleHighlighted(true)
  }

  function handleDescriptionOut (): void {
    setTriangleHighlighted(false)
  }

  return (
    <>
      <Warnings segment={segment} />
      <Triangle highlight={isTriangleHighlighted} />
      {segment.type && (
        <Description
          type={segment.type}
          variantString={segment.variantString}
          updateBubbleDimensions={updateBubbleDimensions}
          onMouseOver={handleDescriptionOver}
          onMouseOut={handleDescriptionOut}
          infoBubbleEl={infoBubbleEl}
          updateHoverPolygon={updateHoverPolygon}
        />
      )}
    </>
  )
}

export default InfoBubbleLower
