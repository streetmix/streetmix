import { useEffect } from 'react'

import { useSelector } from '~/src/store/hooks.js'
import { GROUND_BASELINE_HEIGHT, TILE_SIZE } from '~/src/segments/constants.js'
import { usePrevious } from '~/src/util/usePrevious.js'
import { SEA_LEVEL_RISE_FEET } from './constants.js'
import { calculateSeaLevelRise } from './sea_level.js'
import './SeaLevel.css'

interface SeaLevelProps {
  boundaryWidth: number
  scrollPos: number
}

// Wave image is rendered at 8px tall, so we half it to render an "average".
// It is doubled again in a surge.
const HALF_OF_WAVE_HEIGHT = 8 / 2
const WAVE_OPACITY = 0.4
const LIMBO_OPACITY = 0.2

export function SeaLevel({ boundaryWidth, scrollPos }: SeaLevelProps) {
  const street = useSelector((state) => state.street)
  const draggingType = useSelector((state) => state.ui.draggingType)
  const { seaLevelRise, stormSurge, floodDistance } = useSelector(
    (state) => state.coastmix
  )

  // When switching streets, don't transition sea level height
  const prevStreetId = usePrevious(street.id)
  const animationOff = prevStreetId !== street.id

  let height = 0
  let opacity = 0

  // Only set visual parameters when there is a flood direction
  if (floodDistance[0] !== null || floodDistance[1] !== null) {
    // Baseline height
    // TODO: include sea level elevation with baseline
    height = GROUND_BASELINE_HEIGHT - HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)

    // Calculate how much sea level rises
    const rise = calculateSeaLevelRise(seaLevelRise, stormSurge, street)

    // Total height added together
    height += rise * TILE_SIZE

    // Show visually when sea level rises
    if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
      opacity = WAVE_OPACITY

      // Special case: opacity is lowered when dragging
      if (draggingType) {
        opacity = LIMBO_OPACITY
      }
    }
  }

  // Default style -- floods full width of section
  const styles: React.CSSProperties = {
    height: `${height}px`,
    opacity,
    left: `-${boundaryWidth}px`,
    right: `-${boundaryWidth}px`,
  }

  if (animationOff) {
    styles.transition = 'none'
  }

  // Affect the rain canvas when storm surging
  // TODO: don't do DOM manip
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.weather-canvas')
    if (!el) return
    if (stormSurge) {
      el.style.top = `-${height - 45}px`
    } else {
      el.style.top = 'auto'
    }
  }, [stormSurge, height])

  const classNames = ['sea-level-waves']
  if (stormSurge) {
    classNames.push('sea-level-surge')
  }
  if (animationOff) {
    classNames.push('sea-level-animation-off')
  }

  // Special case if either distance is `max` (flooding across the entire
  // section), or when something is being dragged (we don't calculate flooding
  // distance mid-drag). Note this doesn't animate the right side.
  if (
    floodDistance[0] === 'max' ||
    floodDistance[1] === 'max' ||
    draggingType
  ) {
    return (
      <div className="sea-level-rise" style={styles}>
        <div className={classNames.join(' ')}>
          <div style={getWavePosition(scrollPos)} />
        </div>
      </div>
    )
  }

  return (
    <>
      {floodDistance[0] !== null && (
        <div
          className="sea-level-rise sea-level-rise-left"
          style={{
            ...styles,
            width: `${boundaryWidth + floodDistance[0]}px`,
            right: 'auto',
          }}
        >
          <div className={classNames.join(' ')}>
            <div style={getWavePosition(scrollPos)} />
          </div>
        </div>
      )}
      {floodDistance[1] !== null && (
        <div
          className="sea-level-rise sea-level-rise-right"
          style={{
            ...styles,
            width: `${boundaryWidth + floodDistance[1]}px`,
            left: 'auto',
          }}
        >
          <div className={classNames.join(' ')}>
            <div style={getWavePosition(scrollPos)} />
          </div>
        </div>
      )}
    </>
  )
}

// Wave position for parallax scrolling
function getWavePosition(scrollPos: number): React.CSSProperties {
  const speed = 0.5
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`,
  }
}
