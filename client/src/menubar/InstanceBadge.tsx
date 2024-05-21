import React from 'react'
import { useSelector } from '../store/hooks'
import { ENV, STREETMIX_INSTANCE } from '../app/config'
import './InstanceBadge.scss'

function InstanceBadge ({
  label
}: {
  label?: string
}): React.ReactElement | null {
  const offline = useSelector((state) => state.system.offline)

  const classNames = ['instance-badge']
  const details = getDetails(offline, label)

  if (details.className !== undefined) {
    classNames.push(details.className)
  }

  // Displays a label. Nothing happens if there isn't one.
  if (details.label !== undefined) {
    return <div className={classNames.join(' ')}>{details.label}</div>
  } else {
    return null
  }
}

function getDetails (
  offline: boolean,
  label?: string
): { label?: string, className?: string } {
  // If a label is not provided, determine one
  if (label === undefined) {
    if (offline) {
      return {
        label: 'Demo',
        className: 'instance-label-demo'
      }
    } else {
      switch (STREETMIX_INSTANCE ?? ENV) {
        case 'development':
          return {
            label: 'Dev',
            className: 'instance-label-development'
          }
        case 'staging':
          return {
            label: 'Staging',
            className: 'instance-label-staging'
          }
        case 'sandbox':
          return {
            label: 'Sandbox',
            className: 'instance-label-sandbox'
          }
        default:
          return {}
      }
    }
  }

  return {
    label
  }
}

export default InstanceBadge
