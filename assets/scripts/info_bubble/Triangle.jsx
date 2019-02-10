import React from 'react'
import PropTypes from 'prop-types'
import './Triangle.scss'

export default function Triangle (props) {
  const triangleClassNames = ['info-bubble-triangle']

  if (props.highlight === true) {
    triangleClassNames.push('info-bubble-triangle-highlight')
  }

  return (
    <div className={triangleClassNames.join(' ')} />
  )
}

Triangle.prototype.propTypes = {
  highlight: PropTypes.bool
}

Triangle.prototype.defaultProps = {
  highlight: false
}
