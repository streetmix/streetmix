import React from 'react'
import PropTypes from 'prop-types'

CapacityBar.propTypes = {
  amount: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['minimum', 'average', 'potential'])
}

function CapacityBar ({ amount, max, type }) {
  const classNames = ['capacity-bar']
  if (type === 'minimum') {
    classNames.push('capacity-bar-minimum')
  } else if (type === 'average') {
    classNames.push('capacity-bar-average')
  } else if (type === 'potential') {
    classNames.push('capacity-bar-potential')
  }

  return (
    <div
      className={classNames.join(' ')}
      style={{
        width: `${(amount / max) * 100}%`
      }}
    >
      &nbsp;
    </div>
  )
}

export default CapacityBar
