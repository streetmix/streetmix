import React from 'react'
import { useSelector } from 'react-redux'
import EmptySegment from './EmptySegment'

/**
 * This is a "container" component in the React presentational/container
 * component pattern. This component determines how many child <EmptySegment />
 * components are rendered, how wide they are, and where they are positioned.
 */
function EmptySegmentContainer (props) {
  const remainingWidth = useSelector((state) => state.street.remainingWidth)
  const occupiedWidth = useSelector((state) => state.street.occupiedWidth)
  const emptySegments = []

  // If there is no remaining width, display nothing
  if (remainingWidth > 0) {
    // If street is not occupied by any segments, then only display one empty segment
    // at the full width of the street (which equals `remainingWidth`)
    if (!occupiedWidth) {
      emptySegments.push({ width: remainingWidth })
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
