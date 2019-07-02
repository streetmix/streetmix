import React from 'react'
import PropTypes from 'prop-types'
import { ENV } from '../app/config'
import './EnvironmentBadge.scss'

export default class EnvironmentBadge extends React.PureComponent {
  static propTypes = {
    label: PropTypes.string
  }

  state = {
    label: null,
    className: null
  }

  static getDerivedStateFromProps (props, state) {
    // If a label is not provided, determine one using ENV
    if (!props.label) {
      switch (ENV) {
        case 'development':
          return {
            label: 'Dev',
            className: 'environment-label-development'
          }
        case 'staging':
          return {
            label: 'Staging',
            className: 'environment-label-staging'
          }
        case 'sandbox':
          return {
            label: 'Sandbox',
            className: 'environment-label-sandbox'
          }
        case 'demo':
          return {
            label: 'Demo',
            className: 'environment-label-demo'
          }
        default:
          return null
      }
    }

    return {
      label: props.label
    }
  }

  render () {
    const classNames = ['environment-badge']
    if (this.state.className) {
      classNames.push(this.state.className)
    }

    // Displays a label. Nothing happens if there isn't one.
    if (this.state.label) {
      return (
        <div className={classNames.join(' ')}>
          {this.state.label}
        </div>
      )
    } else {
      return null
    }
  }
}
