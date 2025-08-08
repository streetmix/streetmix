import React from 'react'

import { useSelector } from '~/src/store/hooks'
import { TILE_SIZE } from '~/src/segments/constants'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units'
import './SeaLevel.css'

interface SeaLevelProps {
  scrollPos: number
}

const GROUND_AT_ELEVATION_ZERO = 45
const HALF_OF_WAVE_HEIGHT = 8 / 2 /* wave image is rendered at 8px tall */
const WAVE_OPACITY = 0.4

function SeaLevel (props: SeaLevelProps): React.ReactElement {
  const { scrollPos } = props
  const { seaLevelRise, stormSurge } = useSelector((state) => state.coastmix)

  let height = GROUND_AT_ELEVATION_ZERO - HALF_OF_WAVE_HEIGHT
  let opacity = 0
  switch (seaLevelRise) {
    case 2030:
      height += convertImperialMeasurementToMetric(1.5) * TILE_SIZE
      opacity = WAVE_OPACITY
      break
    case 2050:
      height += convertImperialMeasurementToMetric(2.5) * TILE_SIZE
      opacity = WAVE_OPACITY
      break
    case 2070:
      height += convertImperialMeasurementToMetric(4.5) * TILE_SIZE
      opacity = WAVE_OPACITY
      break
  }

  const surge = stormSurge
    ? convertImperialMeasurementToMetric(2) * TILE_SIZE
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
