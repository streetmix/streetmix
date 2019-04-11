import React from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import './SkyBackgroundObjects.scss'

export function SkyBackgroundObjects (props) {
  return (
    <TransitionGroup className="sky-background-objects">
      {props.objects.map((object) => (
        <CSSTransition
          key={object.image}
          timeout={{
            enter: 0,
            exit: 500
          }}
          classNames="sky-background-object"
        >
          <div
            style={{
              width: object.width,
              height: object.height,
              position: 'absolute',
              left: `calc(${object.left * 100}% - (${object.width}px / 2)`,
              top: `calc(${object.top * 100}% - (${object.height}px / 2)`
            }}
          >
            <img src={object.image} style={{ width: '100%', height: '100%' }} />
          </div>
        </CSSTransition>
      ))}
    </TransitionGroup>
  )
}

SkyBackgroundObjects.propTypes = {
  objects: PropTypes.arrayOf(PropTypes.shape({
    images: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    top: PropTypes.number,
    left: PropTypes.number
  }))
}

SkyBackgroundObjects.defaultProps = {
  objects: []
}

export default SkyBackgroundObjects
