import { useSelector } from '~/src/store/hooks.js'
import { calculateSlope } from './slope.js'
import './TestSlope.css'

import type { Segment } from '@streetmix/types'

interface Props {
  slice: Segment
}

export function TestSlope({ slice }: Props) {
  const street = useSelector((state) => state.street)
  const debug = useSelector((state) => state.flags.DEBUG_SLICE_SLOPE.value)
  const sliceIndex = street.segments.findIndex((s) => s.id === slice.id)
  const slopeData = calculateSlope(street, sliceIndex)

  // Bail if slice has been removed
  if (slopeData === null) return null

  const { slope, ratio, warnings } = slopeData

  const styles = {
    color: 'green',
  }
  if (warnings.slopeExceededPath) {
    styles.color = 'yellow'
  }
  if (warnings.slopeExceededBerm) {
    styles.color = 'red'
  }

  return (
    <div className="test-slope-container">
      {debug && street.segments[sliceIndex].slope.on && (
        <div className="slope-debug">
          <p style={styles}>{slope} %</p>
          <p style={styles}>{ratio ?? 0}:1</p>
        </div>
      )}
    </div>
  )
}
