import React from 'react'
import PropTypes from 'prop-types'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { images } from '../app/load_resources'
import './SkyObjects.scss'

SkyObjects.propTypes = {
  objects: PropTypes.arrayOf(
    PropTypes.shape({
      images: PropTypes.string,
      width: PropTypes.number,
      height: PropTypes.number,
      top: PropTypes.number,
      left: PropTypes.number
    })
  )
}

function SkyObjects ({ objects = [] }) {
  return (
    <TransitionGroup className="sky-background-objects">
      {objects.map((object) => {
        const img = images.get(object.image)

        // Render only if asset is found
        if (img) {
          return (
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
                <img src={img.src} style={{ width: '100%', height: '100%' }} />
              </div>
            </CSSTransition>
          )
        }

        // Render nothing if asset is missing
        // We cannot pass `null` to <TransitionGroup>, it will throw an error
        // So we pass a Fragment, which must also have a key because it is
        // inside an array
        // TODO: Render placeholder ("dev") asset? That way it will be more
        // obvious that something is missing, and work on placement/size can
        // be done even if an actual asset isn't ready yet.
        return <React.Fragment key={object.image} />
      })}
    </TransitionGroup>
  )
}

export default SkyObjects
