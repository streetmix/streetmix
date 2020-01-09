import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import Draggable from 'react-draggable'
import CloseButton from '../ui/CloseButton'
import { getAllEnvirons } from './environs'
import { DEFAULT_ENVIRONS } from './constants'
import { setEnvironment } from '../store/actions/street'
import { toggleToolbox } from '../store/actions/ui'
import './EnvironmentEditor.scss'

function EnvironmentEditor (props) {
  const selected = useSelector(
    (state) => state.street.environment || DEFAULT_ENVIRONS
  )
  const show = useSelector((state) => state.ui.toolboxVisible || false)
  const dispatch = useDispatch()

  const handleClick = (event, env) => {
    dispatch(setEnvironment(env.id))
  }

  const handleClose = (event) => {
    dispatch(toggleToolbox())
  }

  const envs = getAllEnvirons()
  const transitions = useTransition(show, null, {
    from: { opacity: 0, transform: 'scale(0.75)', pointerEvents: 'none' },
    enter: { opacity: 1, transform: 'scale(1)', pointerEvents: 'auto' },
    leave: { opacity: 0, transform: 'scale(0.85)', pointerEvents: 'none' },
    config: { tension: 600, velocity: 20, clamp: true }
  })

  return transitions.map(
    ({ item, key, props }) =>
      item && (
        <Draggable bounds="parent" handle="header" cancel=".close" key={key}>
          {/* Two containers are necessary because different libraries are applying CSS transforms */}
          {/* Outer container is transformed by Draggable's position */}
          <div className="environment-editor environment-editor-container-outer">
            {/* Inner container contains transition styles from Transition */}
            <animated.div
              className="environment-editor-container-inner"
              style={props}
            >
              <header>
                <h3>Environment</h3>
                <CloseButton onClick={handleClose} />
              </header>
              <div className="environment-editor-content">
                <div className="environment-select-grid">
                  {envs.map((env) => {
                    const { id, name, style } = env
                    const classNames = ['environment-select']

                    if (selected === id) {
                      classNames.push('environment-active')
                    } else if (!selected && id === DEFAULT_ENVIRONS) {
                      classNames.push('environment-active')
                    }

                    return (
                      <div
                        className={classNames.join(' ')}
                        key={id}
                        style={style}
                        title={name}
                        onClick={(event) => handleClick(event, env)}
                      />
                    )
                  })}
                </div>
              </div>
            </animated.div>
          </div>
        </Draggable>
      )
  )
}

export default EnvironmentEditor
