import { useSelector } from '~/src/store/hooks.js'
import { getRiseRunValues, getSlopeWarnings } from './slope.js'
import './TestSlope.css'

import type { SliceItem } from '@streetmix/types'

interface Props {
  slice: SliceItem
}

export function TestSlope({ slice }: Props) {
  const debug = useSelector((state) => state.flags.DEBUG_SLICE_SLOPE.value)

  // Bail early if debug flag is not on
  if (!debug) return null

  const { slope, ratio } = getRiseRunValues(slice.slope.values, slice.width)
  const warnings = getSlopeWarnings(ratio)

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
      {slice.slope.on && (
        <div className="slope-debug">
          <p style={styles}>{slope} %</p>
          <p style={styles}>{ratio ?? 0}:1</p>
        </div>
      )}
    </div>
  )
}
