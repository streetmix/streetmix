import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { ENV } from '../app/config'
import './EnvironmentBadge.scss'

EnvironmentBadge.propTypes = {
  label: PropTypes.string,
  env: PropTypes.string
}

function EnvironmentBadge ({ label, env }) {
  const offline = useSelector((state) => state.system.offline)

  const classNames = ['environment-badge']
  const details = getDetails(label, env, offline)

  if (details.className) {
    classNames.push(details.className)
  }

  // Displays a label. Nothing happens if there isn't one.
  if (details.label) {
    return <div className={classNames.join(' ')}>{details.label}</div>
  } else {
    return null
  }
}

function getDetails (label, env, offline) {
  // If a label is not provided, determine one
  if (!label) {
    if (offline) {
      return {
        label: 'Demo',
        className: 'environment-label-demo'
      }
    } else {
      switch (env || ENV) {
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
    label: label
  }
}

export default React.memo(EnvironmentBadge)
