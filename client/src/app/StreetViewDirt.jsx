import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getStreetSectionTop } from './window_resize'
import './StreetViewDirt.scss'

function getDirtElementHeight () {
  const streetSectionTop = getStreetSectionTop()
  return window.innerHeight - streetSectionTop - 400 + 180
}

const StreetViewDirt = ({ buildingWidth }) => {
  const dirtStyle = {
    marginLeft: -buildingWidth + 'px',
    marginRight: -buildingWidth + 'px',
    height: getDirtElementHeight() + 'px'
  }
  const width = `${buildingWidth}px`

  // On window resize, figure out what height it should be and apply it
  const dirtEl = useRef(null)
  useEffect(() => {
    function handleResize () {
      dirtEl.current.style.height = getDirtElementHeight() + 'px'
    }

    // Set window listener to do this
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section className="street-section-dirt" ref={dirtEl} style={dirtStyle}>
      <div className="street-section-dirt-left" style={{ width }} />
      <div className="street-section-dirt-right" style={{ width }} />
    </section>
  )
}

StreetViewDirt.propTypes = {
  buildingWidth: PropTypes.number
}

export default StreetViewDirt
