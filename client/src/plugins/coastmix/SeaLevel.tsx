import React from 'react'
import { useSelector } from '~/src/store/hooks'
import './SeaLevel.css'

function SeaLevel () {
  const seaLevelRise = useSelector((state) => state.coastmix.seaLevelRise)

  let height = 0
  let opacity = 0
  switch (seaLevelRise) {
    case 2030:
      height = 75
      opacity = 1
      break
    case 2050:
      height = 150
      opacity = 1
      break
    case 2070:
      height = 250
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
