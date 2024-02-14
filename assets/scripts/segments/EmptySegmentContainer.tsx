import React from 'react'
import { useSelector } from '../store/hooks'
import EmptySegment from './EmptySegment'

function EmptySegmentContainer (): React.ReactElement[] {
  const remainingWidth = useSelector((state) => state.street.remainingWidth)
  const occupiedWidth = useSelector((state) => state.street.occupiedWidth)
  const emptySegments = []

  // If there is no remaining width, display nothing
  if (remainingWidth > 0) {
    // If street is not occupied by any segments, then only display one empty segment
    // at the full width of the street (which equals `remainingWidth`)
    if (occupiedWidth === 0 || occupiedWidth === undefined) {
      emptySegments.push({ width: remainingWidth, left: 0 })
    } else {
      // If the street has segments, then we display 2 segments of equal width at the
      // left and right side of the street by splitting the remaining width in half.
      const width = remainingWidth / 2

      emptySegments.push(
        { width, left: 0 },
        { width, left: width + occupiedWidth }
      )
    }
  }

  return emptySegments.map(({ width, left }, i) => (
    <EmptySegment key={i} width={width} left={left} />
  ))
}

export default EmptySegmentContainer
