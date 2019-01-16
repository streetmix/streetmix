import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getAllEnvirons } from './environs'
import { setEnvironment } from '../store/actions/street'
import './EnvironmentEditor.scss'

class EnvironmentEditor extends Component {
  static propTypes = {
    selected: PropTypes.string,
    setEnvironment: PropTypes.func.isRequired
  }

  static defaultProps = {
    selected: 'defualt'
  }

  handleClick = (event, env) => {
    this.props.setEnvironment(env.id)

    // Temp: affect the DOM, but don't save data
    const skyEl = document.querySelector('.sky-background')

    function transitionBackground (env) {
      const oldBg = skyEl.querySelector('div')
      const newBg = document.createElement('div')
      if (env.style.backgroundColor) {
        newBg.style.backgroundColor = env.style.backgroundColor
      }
      if (env.style.backgroundImage) {
        newBg.style.backgroundImage = env.style.backgroundImage
      }
      skyEl.insertBefore(newBg, oldBg)
      oldBg.classList.add('sky-transition-out')
      window.setTimeout(() => {
        oldBg.remove()
      }, 500)
    }

    transitionBackground(env)

    if (env.cloudOpacity) {
      document.querySelector('.rear-clouds').style.opacity = env.cloudOpacity
      document.querySelector('.front-clouds').style.opacity = env.cloudOpacity
    } else {
      document.querySelector('.rear-clouds').style.removeProperty('opacity')
      document.querySelector('.front-clouds').style.removeProperty('opacity')
    }
    if (env.invertTextColor) {
      document.querySelector('.street-width-under').style.color = '#a0a0a0'
      document.querySelector('.street-metadata').style.color = '#ffffff'
    } else {
      document.querySelector('.street-width-under').style.removeProperty('color')
      document.querySelector('.street-metadata').style.removeProperty('color')
    }
  }

  render () {
    const envs = getAllEnvirons()

    return (
      <div className="environment-editor-container">
        <header>
          <h3>Environment</h3>
        </header>
        <div className="environment-editor-content">
          <div className="environment-select-grid">
            {envs.map((env) => {
              const { id, name, style } = env
              const classNames = ['environment-select']

              if (this.props.selected === id) {
                classNames.push('environment-active')
              } else if (!this.props.selected && id === 'default') {
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
    )
  }
}

const mapStateToProps = (state) => ({
  selected: state.street.environment
})

const mapDispatchToProps = {
  setEnvironment
}

export default connect(mapStateToProps, mapDispatchToProps)(EnvironmentEditor)
