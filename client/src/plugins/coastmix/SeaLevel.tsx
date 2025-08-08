import React from 'react'

import { useSelector } from '~/src/store/hooks'
import { TILE_SIZE } from '~/src/segments/constants'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units'
import {
  SEA_LEVEL_YEAR_2030,
  SEA_LEVEL_YEAR_2050,
  SEA_LEVEL_YEAR_2070
} from './constants'
import './SeaLevel.css'

interface SeaLevelProps {
  scrollPos: number
}

// In pixels, hardcoded number using existing ground height
const GROUND_AT_ELEVATION_ZERO = 45

// Wave image is rendered at 8px tall, so we half it to render an "average".
// It is doubled again in a surge.
const HALF_OF_WAVE_HEIGHT = 8 / 2
const WAVE_OPACITY = 0.4

// This was originally specc'd at 2 feet (but it was a rough guess anyway)
// Currently at 1.25 to account for visual effect (scaleY) of waves.
const SURGE_HEIGHT_FEET = 1.25

// Estimates for City of Boston
const SEA_LEVEL_RISE_FEET = {
  [SEA_LEVEL_YEAR_2030]: 1.5,
  [SEA_LEVEL_YEAR_2050]: 2.5,
  [SEA_LEVEL_YEAR_2070]: 4.5
}

function SeaLevel (props: SeaLevelProps): React.ReactElement {
  const { scrollPos } = props
  const { seaLevelRise, stormSurge } = useSelector((state) => state.coastmix)

  let height =
    GROUND_AT_ELEVATION_ZERO - HALF_OF_WAVE_HEIGHT * (stormSurge ? 2 : 1)
  let opacity = 0
  if (seaLevelRise in SEA_LEVEL_RISE_FEET) {
    height +=
      convertImperialMeasurementToMetric(SEA_LEVEL_RISE_FEET[seaLevelRise]) *
      TILE_SIZE
    opacity = WAVE_OPACITY
  }

  // Verify this math with the waves and stuff
  const surge = stormSurge
    ? convertImperialMeasurementToMetric(SURGE_HEIGHT_FEET) * TILE_SIZE
    : 0
  const styles = {
    height: `${height + surge}px`,
    opacity
  }

  const classNames = ['sea-level-waves']
  if (surge) {
    classNames.push('sea-level-surge')
  }

  return (
    <div className="sea-level-rise" style={styles}>
      <div
        className={classNames.join(' ')}
        style={getWavePosition(scrollPos)}
      />
    </div>
  )
}

function getWavePosition (scrollPos: number): React.CSSProperties {
  const speed = 0.5
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`
  }
}

export default SeaLevel
