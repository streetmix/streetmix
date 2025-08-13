import React from 'react'

import { useSelector } from '~/src/store/hooks'
import DescriptionPrompt from './DescriptionPrompt'
import Warnings from './Warnings'

import type { BoundaryPosition, Segment } from '@streetmix/types'

interface PopupLowerProps {
  position: number | BoundaryPosition
  setArrowHighlighted: (v: boolean) => void
}

export function PopupLower ({
  position,
  setArrowHighlighted
}: PopupLowerProps): React.ReactElement {
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
