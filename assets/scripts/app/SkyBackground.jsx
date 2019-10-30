import React from 'react'
import PropTypes from 'prop-types'
import { useTransition, animated } from 'react-spring'
import { getEnvirons } from '../streets/environs'
import './SkyBackground.scss'

SkyBackground.propTypes = {
  environment: PropTypes.string
}

function SkyBackground (props) {
  const { environment } = props

  const transitions = useTransition(environment, (key) => key, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 500
    }
  })

  return (
    <div className="sky-background">
      {transitions.map(({ item, props, key }) => (
        <animated.div
          key={key}
          className="sky-background-color"
          style={{ ...props, ...getEnvirons(item).style }}
        />
      ))}
    </div>
  )
}

export default React.memo(SkyBackground)
