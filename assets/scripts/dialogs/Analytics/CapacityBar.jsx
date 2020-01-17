import React from 'react'
import PropTypes from 'prop-types'

const BAR_HEIGHT = '70px'

CapacityBar.propTypes = {
  amount: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
}

function CapacityBar ({ amount, max, color }) {
  const widthPercent = `${(Number.parseInt(amount, 10) / max) * 100}%`

  return (
    <div
      className="capacity-bar"
      style={{
        height: BAR_HEIGHT,
        background: color,
        display: 'inline-block',
        width: widthPercent
      }}
    >
      &nbsp;
    </div>
  )
}

export default CapacityBar
