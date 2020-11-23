/**
 * Mocks @fortawesome/react-fontawesome to return a simple, empty <svg> element
 * with the correct class name for the given `icon` prop. We use this to keep
 * full <svg> content out of our test snapshots.
 */
import React from 'react'
import PropTypes from 'prop-types'

FontAwesomeIcon.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      prefix: PropTypes.string,
      iconName: PropTypes.string,
      icon: PropTypes.arrayOf(PropTypes.any)
    })
  ]).isRequired,
  className: PropTypes.string
}

export function FontAwesomeIcon (props) {
  const { icon, className } = props
  const classNames = ['svg-inline--fa']

  if (className) {
    classNames.push(className)
  }

  if (typeof icon === 'string') {
    classNames.push(icon)
  } else {
    classNames.push(`fa-${icon.iconName}`)
  }

  return <svg className={classNames.join(' ')} />
}
