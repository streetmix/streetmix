import { useSelector } from '~/src/store/hooks.js'
import './TestSlope.css'

import type { SliceItem } from '@streetmix/types'
import type { SlopeCalculation } from './slope.js'

interface Props {
  slice: SliceItem
  slopeData: SlopeCalculation
}

export function TestSlope({ slice, slopeData }: Props) {
  const debug = useSelector((state) => state.flags.DEBUG_SLICE_SLOPE.value)

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

  return debug ? (
    <div className="test-slope-container">
      {slice.slope.on && (
        <div className="slope-debug">
          <p style={styles}>{slope} %</p>
          <p style={styles}>{ratio ?? 0}:1</p>
        </div>
      )}
    </div>
  ) : null
}
