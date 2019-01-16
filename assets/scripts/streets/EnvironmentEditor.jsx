import React, { Component } from 'react'
import { getAllEnvirons } from './environs'
import './EnvironmentEditor.scss'

class EnvironmentEditor extends Component {
  state = {
    selected: null
  }

  handleClick = (event, env) => {
    this.setState({
      selected: env
    })
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
            {envs.map(({ id, name, style }) => {
              const classNames = ['environment-select']

              if (this.state.selected === id) {
                classNames.push('environment-active')
              } else if (!this.state.selected && id === 'plain') {
                classNames.push('environment-active')
              }

              return (
                <div
                  className={classNames.join(' ')}
                  key={id}
                  style={style}
                  title={name}
                  onClick={(event) => this.handleClick(event, id)}
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
