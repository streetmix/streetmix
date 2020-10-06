import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import { FormattedMessage } from 'react-intl'
import Draggable from 'react-draggable'
import CloseButton from '../ui/CloseButton'
import { getAllEnvirons } from './environs'
import { DEFAULT_ENVIRONS } from './constants'
import { images } from '../app/load_resources'
import { setEnvironment } from '../store/slices/street'
import { toggleToolbox } from '../store/slices/ui'
import emojiIcon from '../../images/openmoji/color/1F324.svg'
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
                <img
                  src={emojiIcon}
                  alt="Sun behind rain cloud"
                  draggable="false"
                />
                <h3>
                  <FormattedMessage
                    id="tools.environment.heading"
                    defaultMessage="Environment"
                  />
                </h3>
                <CloseButton onClick={handleClose} />
              </header>
              <div className="environment-editor-content">
                <div className="environment-select-grid">
                  {envs.map((env) => {
                    const { id, name, iconStyle } = env
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
                        style={iconStyle}
                        title={name}
                        onClick={(event) => handleClick(event, env)}
                      >
                        {env.iconImage && (
                          <img
                            src={images.get(env.iconImage)?.src}
                            alt=""
                            style={{
                              width: '100%',
                              height: '100%',
                              pointerEvents: 'none',
                              userSelect: 'none'
                            }}
                            draggable={false}
                          />
                        )}
                      </div>
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
