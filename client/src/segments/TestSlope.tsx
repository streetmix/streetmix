import React from 'react'

import { useSelector } from '~/src/store/hooks'
import './TestSlope.css'

import { calculateSlope } from './slope'
import type { Segment } from '@streetmix/types'

interface Props {
  slice: Segment
}

function TestSlope ({ slice }: Props): React.ReactNode | null {
  const street = useSelector((state) => state.street)
  const debug = useSelector((state) => state.flags.DEBUG_SLICE_SLOPE.value)
  const sliceIndex = street.segments.findIndex((s) => s.id === slice.id)
  const slopeData = calculateSlope(street, sliceIndex)

  // Bail if slice has been removed
  if (slopeData === null) return null

  const { slope, ratio, warnings } = slopeData

  const styles = {
    color: 'inherit'
  }
  // TODO: handle slope exceeded for paths
  if (warnings.slopeExceededBerm) {
    styles.color = 'red'
  }

  return (
    <div className="test-slope-container">
      {debug && street.segments[sliceIndex].slope && (
        <div className="slope-debug">
          <p style={styles}>{slope} %</p>
          <p style={styles}>{ratio}:1</p>
        </div>
      )}
    </div>
  )
}

export default TestSlope
