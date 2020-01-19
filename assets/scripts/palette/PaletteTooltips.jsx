import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import './PaletteTooltips.scss'

PaletteTooltips.propTypes = {
  label: PropTypes.string,
  visible: PropTypes.bool,
  pointAt: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number // Not used right now
  })
}

function PaletteTooltips ({ label = null, visible = false, pointAt = {} }) {
  const el = useRef()

  useEffect(() => {
    // pointAt.y is not used right now. we are just hardcoding its
    // vertical position inside the CSS for this component.
    if (pointAt.x) {
      el.current.style.left =
        pointAt.x - el.current.getBoundingClientRect().width / 2 + 'px'
    }
  })

  const classNames = ['palette-tooltip']

  if (visible) {
    classNames.push('palette-tooltip-show')
  }

  return (
    <div className="palette-tooltip-container">
      <div className={classNames.join(' ')} ref={el}>
        <div className="palette-tooltip-contents">{label}</div>
        <div className="palette-tooltip-pointer-container">
          <div className="palette-tooltip-pointer" />
        </div>
      </div>
    </div>
  )
}

export default PaletteTooltips
