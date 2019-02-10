import React from 'react'
import PropTypes from 'prop-types'
import './StreetViewDirt.scss'

const StreetViewDirt = (props) => {
  const dirtStyle = {
    marginLeft: (-props.buildingWidth) + 'px',
    marginRight: (-props.buildingWidth) + 'px'
  }
  const width = `${props.buildingWidth}px`

  return (
    <section id="street-section-dirt" style={dirtStyle}>
      <div className="street-section-dirt-left" style={{ width }} />
      <div className="street-section-dirt-right" style={{ width }} />
    </section>
  )
}

StreetViewDirt.propTypes = {
  buildingWidth: PropTypes.number
}

export default StreetViewDirt
