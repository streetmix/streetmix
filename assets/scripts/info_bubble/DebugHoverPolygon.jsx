import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

/**
 * Draws a polygon of the "Tognazzini zone" area.
 *
 * @param {HTMLCanvasElement} canvas - canvas element to draw to
 * @param {Array} polygon - array of points for the polygon
 */
const drawPolygon = (canvas, polygon) => {
  // Early exit if polygon or canvas isn't set
  if (!polygon.length || !polygon[0].length) return
  if (!canvas) return

  const ctx = canvas.getContext('2d')

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw the path
  ctx.strokeStyle = 'red'
  ctx.fillStyle = 'rgba(255, 0, 0, .1)'
  ctx.beginPath()
  ctx.moveTo(polygon[0][0], polygon[0][1])
  for (let i = 1; i < polygon.length; i++) {
    ctx.lineTo(polygon[i][0], polygon[i][1])
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

export const DebugHoverPolygon = (props) => {
  // When the window / viewport resizes, set the width and
  // height of the canvas element.
  const el = useRef(null)
  const handleResize = () => {
    if (!el.current) return

    el.current.width = window.innerWidth
    el.current.height = window.innerHeight
  }
  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  })

  // Draw the polygon area.
  useEffect(() => {
    if (props.enabled) {
      drawPolygon(el.current, props.hoverPolygon)
    }
  }, [props.hoverPolygon, props.enabled])

  // Render component if enabled.
  if (props.enabled) {
    return (
      <div className="debug-hover-polygon">
        <canvas
          width={window.innerWidth}
          height={window.innerHeight}
          ref={el}
        />
      </div>
    )
  }

  // Bail if disabled
  return null
}

DebugHoverPolygon.propTypes = {
  enabled: PropTypes.bool,
  hoverPolygon: PropTypes.array
}

DebugHoverPolygon.defaultProps = {
  enabled: false,
  hoverPolygon: []
}

function mapStateToProps (state) {
  return {
    enabled: state.flags.INFO_BUBBLE_HOVER_POLYGON.value,
    hoverPolygon: state.infoBubble.hoverPolygon
  }
}

export default connect(mapStateToProps)(DebugHoverPolygon)
