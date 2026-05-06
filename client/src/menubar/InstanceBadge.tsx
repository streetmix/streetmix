import { useSelector } from '../store/hooks.js'
import { ENV, STREETMIX_INSTANCE } from '../app/config.js'
import './InstanceBadge.css'

interface InstanceBadgeProps {
  label?: string
  className?: string
}

export function InstanceBadge({ label, className }: InstanceBadgeProps) {
  const offline = useSelector((state) => state.system.offline)

  const classNames = ['instance-badge']
  if (className) {
    classNames.push(className)
  }

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

function getDetails(
  offline: boolean,
  label?: string
): { label?: string; className?: string } {
  // If a label is not provided, determine one
  if (label === undefined) {
    if (offline) {
      return {
        label: 'Demo',
        className: 'instance-label-demo',
      }
    } else {
      switch (STREETMIX_INSTANCE ?? ENV) {
        case 'development':
          return {
            label: 'Dev',
            className: 'instance-label-development',
          }
        case 'staging':
          return {
            label: 'Staging',
            className: 'instance-label-staging',
          }
        case 'sandbox':
          return {
            label: 'Sandbox',
            className: 'instance-label-sandbox',
          }
        case 'coastmix':
          return {
            label: 'by Streetmix',
            className: 'instance-label-coastmix',
          }
        default:
          return {}
      }
    }
  }

  return {
    label,
  }
}
