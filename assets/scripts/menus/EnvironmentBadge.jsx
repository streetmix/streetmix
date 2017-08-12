import React from 'react'
import PropTypes from 'prop-types'
import { ENV } from '../app/config'
import { system } from '../preinit/system_capabilities'

export default class EnvironmentBadge extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string
  }

  determineLabel = () => {
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
        default:
          break
      }
    }

    // Check if no internet mode
    if (system.noInternet === true) {
      label = 'Demo'
    }

    return label
  }

  render () {
    // Set the label. Nothing happens if there isn't one.
    return (
      <div className="environment-badge">
        {this.props.label || this.determineLabel()}
      </div>
    )
  }
}
