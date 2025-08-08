import React from 'react'

import { useSelector } from '~/src/store/hooks'
import { TILE_SIZE } from '~/src/segments/constants'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units'
import './SeaLevel.css'

interface SeaLevelProps {
  scrollPos: number
}

function SeaLevel (props: SeaLevelProps): React.ReactElement {
  const { scrollPos } = props
  const { seaLevelRise, stormSurge } = useSelector((state) => state.coastmix)

  let height = 45 // matches ground at elevation 0
  let opacity = 0
  switch (seaLevelRise) {
    case 2030:
      height += convertImperialMeasurementToMetric(1.5) * TILE_SIZE
      opacity = 1
      break
    case 2050:
      height += convertImperialMeasurementToMetric(2.5) * TILE_SIZE
      opacity = 1
      break
    case 2070:
      height += convertImperialMeasurementToMetric(4.5) * TILE_SIZE
      opacity = 1
      break
  }

  const surge = stormSurge
    ? convertImperialMeasurementToMetric(2) * TILE_SIZE
    : 0
  const styles = {
    height: `${height + surge}px`,
    opacity
  }

  return (
    <div className="sea-level-rise" style={styles}>
      <div className="sea-level-waves" style={getWavePosition(scrollPos)} />
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
