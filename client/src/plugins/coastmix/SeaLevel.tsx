import { useSelector } from '~/src/store/hooks.js'
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from '~/src/segments/constants.js'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units.js'
import { SEA_LEVEL_RISE_FEET, SURGE_HEIGHT_FEET } from './constants.js'
import './SeaLevel.css'

interface SeaLevelProps {
  boundaryWidth: number
  scrollPos: number
}

// Wave image is rendered at 8px tall, so we half it to render an "average".
// It is doubled again in a surge.
const HALF_OF_WAVE_HEIGHT = 8 / 2
const WAVE_OPACITY = 0.4

export function SeaLevel({ boundaryWidth, scrollPos }: SeaLevelProps) {
  const { seaLevelRise, floodDirection, floodDistance, stormSurge } =
    useSelector((state) => state.coastmix)

  let height =
    GROUND_BASELINE_HEIGHT - HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)
  let opacity = 0
  if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
    height +=
      convertImperialMeasurementToMetric(
        SEA_LEVEL_RISE_FEET[seaLevelRise as keyof typeof SEA_LEVEL_RISE_FEET]
      ) * TILE_SIZE
    opacity = WAVE_OPACITY
  }

  // Verify this math with the waves and stuff
  const surge = stormSurge
    ? convertImperialMeasurementToMetric(SURGE_HEIGHT_FEET) * TILE_SIZE
    : 0

  // Default style -- floods entire section
  const styles: React.CSSProperties = {
    height: `${height + surge}px`,
    opacity,
    left: `-${boundaryWidth}px`,
    right: `-${boundaryWidth}px`,
  }

  // If flood direction comes from the left
  if (floodDirection === 'left' && floodDistance !== null) {
    styles.width = `${boundaryWidth + floodDistance}px`
    styles.right = 'auto'
  }
  if (floodDirection === 'right' && floodDistance !== null) {
    styles.left = 'auto'
    styles.width = `${boundaryWidth + floodDistance}px`
  }

  const classNames = ['sea-level-waves']
  if (surge) {
    classNames.push('sea-level-surge')
  }

  return (
    <div className="sea-level-rise" style={styles}>
      <div className={classNames.join(' ')}>
        <div style={getWavePosition(scrollPos)} />
      </div>
    </div>
  )
}

function getWavePosition(scrollPos: number): React.CSSProperties {
  const speed = 0.5
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`,
  }
}
