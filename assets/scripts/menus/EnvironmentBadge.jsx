import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { ENV } from '../app/config'

export class EnvironmentBadge extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string,
    noInternet: PropTypes.bool
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
        default:
          break
      }
    }

    // Check if no internet mode
    if (this.props.noInternet === true) {
      label = 'Demo'
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
        default:
          break
      }
    }

    // Check if no internet mode
    if (this.props.noInternet === true) {
      className += ' environment-label-demo'
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

function mapStateToProps (state) {
  return {
    noInternet: state.system.noInternet
  }
}

export default connect(mapStateToProps)(EnvironmentBadge)
