import React from 'react'
import PropTypes from 'prop-types'
import { ENV } from '../app/config'
import './EnvironmentBadge.scss'

export default class EnvironmentBadge extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string
  }

  getLabel = () => {
    let label

    // If a label is not provided, determine one using ENV
    if (!this.props.label) {
      switch (ENV) {
        case 'development':
          label = 'Dev'
          break
        case 'staging':
          label = 'Staging'
          break
        case 'sandbox':
          label = 'Sandbox'
          break
        case 'demo':
          label = 'Demo'
          break
        default:
          break
      }
    }

    return label
  }

  getClassName = () => {
    let className = 'environment-badge'

    // If a label is not provided, determine one using ENV
    if (!this.props.label) {
      switch (ENV) {
        case 'development':
          className += ' environment-label-development'
          break
        case 'staging':
          className += ' environment-label-staging'
          break
        case 'sandbox':
          className += ' environment-label-sandbox'
          break
        case 'demo':
          className += ' environment-label-demo'
          break
        default:
          break
      }
    }

    return className
  }

  render () {
    // Set the label. Nothing happens if there isn't one.
    return (
      <div className={this.getClassName()}>
        {this.props.label || this.getLabel()}
      </div>
    )
  }
}
