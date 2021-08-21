import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { ENV } from '../app/config'
import './EnvironmentBadge.scss'

EnvironmentBadge.propTypes = {
  label: PropTypes.string,
  env: PropTypes.string
}

function EnvironmentBadge (props) {
  const offline = useSelector((state) => state.system.offline)

  const classNames = ['environment-badge']
  const { label, className } = getDetails(props, offline)

  if (className) {
    classNames.push(className)
  }

  // Displays a label. Nothing happens if there isn't one.
  if (label) {
    return <div className={classNames.join(' ')}>{label}</div>
  } else {
    return null
  }
}

function getDetails (props, offline) {
  // If a label is not provided, determine one
  if (!props.label) {
    if (offline) {
      return {
        label: 'Demo',
        className: 'environment-label-demo'
      }
    } else {
      switch (props.env || ENV) {
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
        default:
          return {}
      }
    }
  }

  return {
    label: props.label
  }
}

export default React.memo(EnvironmentBadge)
