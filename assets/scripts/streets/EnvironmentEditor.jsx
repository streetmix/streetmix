import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Draggable from 'react-draggable'
import { Transition } from 'react-spring/renderprops'
import CloseButton from '../ui/CloseButton'
import { getAllEnvirons } from './environs'
import { DEFAULT_ENVIRONS } from './constants'
import { setEnvironment } from '../store/actions/street'
import { toggleToolbox } from '../store/actions/ui'
import './EnvironmentEditor.scss'

class EnvironmentEditor extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    selected: PropTypes.string,
    setEnvironment: PropTypes.func.isRequired,
    toggleToolbox: PropTypes.func.isRequired
  }

  static defaultProps = {
    visible: false,
    selected: DEFAULT_ENVIRONS
  }

  handleClick = (event, env) => {
    this.props.setEnvironment(env.id)
  }

  handleClose = (event) => {
    this.props.toggleToolbox()
  }

  render () {
    const envs = getAllEnvirons()
    const show = [ this.props.visible ]

    return (
      <Transition
        items={show}
        from={{ opacity: 0, transform: 'scale(0.75)', pointerEvents: 'none' }}
        enter={{ opacity: 1, transform: 'scale(1)', pointerEvents: 'auto' }}
        leave={{ opacity: 0, transform: 'scale(0.85)', pointerEvents: 'none' }}
        config={{ tension: 600, velocity: 20, clamp: true }}
      >
        {show => show && (props => (
          <Draggable
            bounds="parent"
            handle="header"
            cancel=".close"
          >
            {/* Outer container is transformed by Draggable's position */}
            <div className="environment-editor environment-editor-container-outer">
              {/* Inner container contains transition styles from Transition */}
              <div className="environment-editor-container-inner" style={props}>
                <header>
                  <h3>Environment</h3>
                  <CloseButton onClick={this.handleClose} />
                </header>
                <div className="environment-editor-content">
                  <div className="environment-select-grid">
                    {envs.map((env) => {
                      const { id, name, style } = env
                      const classNames = ['environment-select']

                      if (this.props.selected === id) {
                        classNames.push('environment-active')
                      } else if (!this.props.selected && id === DEFAULT_ENVIRONS) {
                        classNames.push('environment-active')
                      }

                      return (
                        <div
                          className={classNames.join(' ')}
                          key={id}
                          style={style}
                          title={name}
                          onClick={(event) => this.handleClick(event, env)}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Draggable>
        ))}
      </Transition>
    )
  }
}

const mapStateToProps = (state) => ({
  selected: state.street.environment,
  visible: state.ui.toolboxVisible
})

const mapDispatchToProps = {
  setEnvironment,
  toggleToolbox
}

export default connect(mapStateToProps, mapDispatchToProps)(EnvironmentEditor)
