import React, { Component } from 'react'
import './EnvironmentEditor.scss'

const ENVIRONS = [
  'plain',
  'twilight',
  'sunset',
  'sunset2',
  'sunrise',
  'night',
  'karl'
]

class EnvironmentEditor extends Component {
  state = {
    selected: ENVIRONS[0]
  }

  handleClick = (event, env) => {
    this.setState({
      selected: env
    })
  }

  render () {
    return (
      <div className="environment-editor-container">
        <header>
          <h3>Environment</h3>
        </header>
        <div className="environment-editor-content">
          <div className="environment-select-grid">
            {ENVIRONS.map((env) => {
              const classNames = [
                'environment-select',
                `env-${env}`
              ]

              if (this.state.selected === env) {
                classNames.push('environment-active')
              }

              return (
                <div
                  className={classNames.join(' ')}
                  key={env}
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

export default EnvironmentEditor
