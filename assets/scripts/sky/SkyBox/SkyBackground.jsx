import React from 'react'
import PropTypes from 'prop-types'
import { useTransition, animated } from '@react-spring/web'
import { getEnvirons } from '../environs'
import './SkyBackground.scss'

function SkyBackground (props) {
  const { environment } = props

  const transitions = useTransition(environment, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 500
    }
  })

  return (
    <div className="sky-background">
      {transitions((style, item) => (
        <animated.div
          className="sky-background-color"
          style={{ ...style, ...getEnvirons(item).style }}
        />
      ))}
    </div>
  )
}

SkyBackground.propTypes = {
  environment: PropTypes.string
}

export default React.memo(SkyBackground)
