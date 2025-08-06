import React from 'react'

import { useSelector } from '~/src/store/hooks'
import { TILE_SIZE } from '~/src/segments/constants'
import { convertImperialMeasurementToMetric } from '~/src/util/width_units'
import './SeaLevel.css'

function SeaLevel () {
  const seaLevelRise = useSelector((state) => state.coastmix.seaLevelRise)

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

  const styles = {
    height: `${height}px`,
    opacity
  }

  return <div className="sea-level-rise" style={styles} />
}

export default SeaLevel
