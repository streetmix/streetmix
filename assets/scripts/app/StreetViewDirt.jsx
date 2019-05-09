import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { getStreetSectionTop } from './window_resize'
import './StreetViewDirt.scss'

// Legacy height setter w/ DOM methods.
function handleResize () {
  const streetSectionTop = getStreetSectionTop()
  const streetSectionDirtPos = window.innerHeight - streetSectionTop - 400 + 180
  document.getElementById('street-section-dirt').style.height = streetSectionDirtPos + 'px'
}

const StreetViewDirt = (props) => {
  const dirtStyle = {
    marginLeft: (-props.buildingWidth) + 'px',
    marginRight: (-props.buildingWidth) + 'px'
  }
  const width = `${props.buildingWidth}px`

  // On window resize, figure out what height it should be and apply it
  // TODO: less stop relying on querying other DOM elements
  // (this is legacy behavior, ported to this component)
  useEffect(() => {
    // Set window listener to do this
    window.addEventListener('resize', handleResize)
    // Do it one time
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

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
