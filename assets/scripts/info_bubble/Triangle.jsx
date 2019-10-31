import React from 'react'
import PropTypes from 'prop-types'
import './Triangle.scss'

Triangle.propTypes = {
  highlight: PropTypes.bool
}

function Triangle ({ highlight = false }) {
  const triangleClassNames = ['info-bubble-triangle']

  if (highlight === true) {
    triangleClassNames.push('info-bubble-triangle-highlight')
  }

  return <div className={triangleClassNames.join(' ')} />
}

export default Triangle
