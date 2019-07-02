/**
 * Mocks @fortawesome/react-fontawesome.js to return a simple, empty <svg> element
 * with the correct class name for the given `icon` prop. We use this to keep full
 * <svg> content out of our rendered component tests.
 */
import React from 'react'
import PropTypes from 'prop-types'

export function FontAwesomeIcon (props) {
  const classNames = ['svg-inline--fa']

  if (typeof props.icon === 'string') {
    classNames.push(props.icon)
  } else {
    classNames.push(`fa-${props.icon.iconName}`)
  }

  return <svg className={classNames.join(' ')} />
}

FontAwesomeIcon.propTypes = {
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      prefix: PropTypes.string,
      iconName: PropTypes.string,
      icon: PropTypes.arrayOf(PropTypes.any)
    })
  ]).isRequired
}
