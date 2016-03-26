/* global ENV */

export function setEnvironmentBadge (label) {
  // If a label is not provided, determine one using ENV
  if (!label) {
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

  // Set the label. Nothing happens if there isn't one.
  if (label) {
    document.querySelector('.environment-badge').textContent = label
  }
}
