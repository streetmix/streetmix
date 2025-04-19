import React, { createRef, useRef } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

import { images } from '../../app/load_resources'
import './SkyObjects.css'

import type { SkyboxObject } from '@streetmix/types'

interface SkyObjectsProps {
  objects: SkyboxObject[]
}

function SkyObjects ({ objects = [] }: SkyObjectsProps): React.ReactElement {
  // According to "rule of hooks", useRef() must not be called in a loop
  const refs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

  return (
    <TransitionGroup className="sky-background-objects">
      {objects.map((object) => {
        const key = object.image
        const img = images.get(key)
        // Refs are created with createRef and then stored in parent `refs`
        const ref = createRef<HTMLDivElement>()
        refs.current[key] = ref

        const style: React.CSSProperties = {
          width: object.width,
          height: object.height,
          position: 'absolute',
          left: `calc(${object.left * 100}% - ${object.width / 2}px)`,
          top: `calc(${object.top * 100}% - ${object.height / 2}px)`
        }

        // Render only if asset is found
        if (img !== undefined) {
          return (
            <CSSTransition
              key={object.image}
              nodeRef={ref}
              appear={true}
              timeout={{
                enter: 0,
                exit: 500
              }}
              classNames="sky-background-object"
            >
              <div ref={ref} style={style}>
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
