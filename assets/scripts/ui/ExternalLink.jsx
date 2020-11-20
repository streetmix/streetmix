import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'

ExternalLink.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  href: PropTypes.string.isRequired
}

function ExternalLink ({ children, href, ...restProps }) {
  const offline = useSelector((state) => state.system.offline)

  if (offline) {
    return children
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...restProps}>
      {children}
    </a>
  )
}

export default ExternalLink
