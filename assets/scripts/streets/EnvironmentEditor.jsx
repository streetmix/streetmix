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
    selected: 'default'
  }

  handleClick = (event, env) => {
    this.props.setEnvironment(env.id)
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
