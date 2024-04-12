import React from 'react'
import { useSpring, animated } from '@react-spring/web'

const BAR_MODIFIER = 0.65

interface CapacityBarProps {
  average: number
  potential: number
  max: number
}

function CapacityBar ({
  average,
  potential,
  max
}: CapacityBarProps): React.ReactElement {
  // Like react-spring's pre-defined `config.slow` but with slightly
  // less tension and friction
  const sharedConfig = {
    mass: 1,
    tension: 250,
    friction: 40
  }
  const averageSpringProps = useSpring({
    config: sharedConfig,
    width: `${(average / potential) * 100}%`
  })
  const maxSpringProps = useSpring({
    config: sharedConfig,
    width: `${(potential / max) * BAR_MODIFIER * 100}%`
  })

  return (
    <animated.div className="capacity-bars" style={maxSpringProps}>
      <div
        className="capacity-bar capacity-bar-potential"
        style={{ width: '100%' }}
      >
        &nbsp;
      </div>
      <animated.div
        className="capacity-bar capacity-bar-average"
        style={averageSpringProps}
      >
        &nbsp;
      </animated.div>
    </animated.div>
  )
}

export default CapacityBar
