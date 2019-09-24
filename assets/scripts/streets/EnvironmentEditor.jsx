import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useTransition, animated } from 'react-spring'
import Draggable from 'react-draggable'
import CloseButton from '../ui/CloseButton'
import { getAllEnvirons } from './environs'
import { DEFAULT_ENVIRONS } from './constants'
import { setEnvironment } from '../store/actions/street'
import { toggleToolbox } from '../store/actions/ui'
import './EnvironmentEditor.scss'

EnvironmentEditor.propTypes = {
  show: PropTypes.bool,
  selected: PropTypes.string,
  setEnvironment: PropTypes.func.isRequired,
  toggleToolbox: PropTypes.func.isRequired
}

function EnvironmentEditor (props) {
  const { show = false, selected = DEFAULT_ENVIRONS, setEnvironment, toggleToolbox } = props

  const handleClick = (event, env) => {
    setEnvironment(env.id)
  }

  const handleClose = (event) => {
    toggleToolbox()
  }

  const envs = getAllEnvirons()
  const transitions = useTransition(show, null, {
    from: { opacity: 0, transform: 'scale(0.75)', pointerEvents: 'none' },
    enter: { opacity: 1, transform: 'scale(1)', pointerEvents: 'auto' },
    leave: { opacity: 0, transform: 'scale(0.85)', pointerEvents: 'none' },
    config: { tension: 600, velocity: 20, clamp: true }
  })

  return transitions.map(({ item, key, props }) =>
    item && (
      <Draggable
        bounds="parent"
        handle="header"
        cancel=".close"
        key={key}
      >
        {/* Two containers are necessary because different libraries are applying CSS transforms */}
        {/* Outer container is transformed by Draggable's position */}
        <div className="environment-editor environment-editor-container-outer">
          {/* Inner container contains transition styles from Transition */}
          <animated.div className="environment-editor-container-inner" style={props}>
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

const mapStateToProps = (state) => ({
  selected: state.street.environment,
  show: state.ui.toolboxVisible
})

const mapDispatchToProps = {
  setEnvironment,
  toggleToolbox
}

export default connect(mapStateToProps, mapDispatchToProps)(EnvironmentEditor)
