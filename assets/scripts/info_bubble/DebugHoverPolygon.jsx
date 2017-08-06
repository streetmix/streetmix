import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { infoBubble } from './info_bubble'

class DebugHoverPolygon extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.canvas = null
    this.updateDimensions = this.updateDimensions.bind(this)
    this.hidePolygon = this.hidePolygon.bind(this)
    this.drawPolygon = this.drawPolygon.bind(this)

    window.addEventListener('resize', this.updateDimensions)

    // For now: events communicate with legacy `infoBubble` object
    window.addEventListener('stmx:show_debug_hover_polygon', this.drawPolygon)
    window.addEventListener('stmx:hide_debug_hover_polygon', this.hidePolygon)
  }

  shouldComponentUpdate () {
    return this.props.enabled
  }

  componentDidUpdate () {
    this.drawPolygon()
  }

  updateDimensions (event) {
    if (this.props.enabled === false) return

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  hidePolygon () {
    if (!this.canvas) return
    this.canvas.width = this.canvas.width // Setting canvas width will clear it
  }

  drawPolygon () {
    if (this.props.enabled === false) return

    this.hidePolygon()

    const ctx = this.canvas.getContext('2d')
    ctx.strokeStyle = 'red'
    ctx.fillStyle = 'rgba(255, 0, 0, .1)'
    ctx.beginPath()
    ctx.moveTo(infoBubble.hoverPolygon[0][0], infoBubble.hoverPolygon[0][1])
    for (let i = 1; i < infoBubble.hoverPolygon.length; i++) {
      ctx.lineTo(infoBubble.hoverPolygon[i][0], infoBubble.hoverPolygon[i][1])
    }
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  render () {
    if (this.props.enabled === false) return null

    return (
      <div id='debug-hover-polygon'>
        <canvas
          width={this.state.width}
          height={this.state.height}
          ref={(ref) => { this.canvas = ref }}
        />
      </div>
    )
  }
}

DebugHoverPolygon.propTypes = {
  enabled: PropTypes.bool
}

DebugHoverPolygon.defaultProps = {
  enabled: false
}

function mapStateToProps (state) {
  return {
    enabled: state.debug.hoverPolygon
  }
}

export default connect(mapStateToProps)(DebugHoverPolygon)
