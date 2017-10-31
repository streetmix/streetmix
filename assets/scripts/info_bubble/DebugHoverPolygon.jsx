import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { infoBubble } from './info_bubble'

export class DebugHoverPolygon extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool
  }

  static defaultProps = {
    enabled: false
  }

  constructor (props) {
    super(props)

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight,
      polygon: []
    }

    this.canvas = null
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)

    // For now: events communicate with legacy `infoBubble` object
    window.addEventListener('stmx:update_debug_hover_polygon', this.updatePolygon)
  }

  shouldComponentUpdate () {
    return this.props.enabled
  }

  componentDidUpdate () {
    this.drawPolygon()
  }

  updateDimensions = (event) => {
    if (this.props.enabled === false) return

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  updatePolygon = () => {
    if (this.props.enabled === false) return

    this.setState({
      polygon: infoBubble.hoverPolygon
    })
  }

  drawPolygon = () => {
    if (this.props.enabled === false) return
    if (!this.canvas) return

    this.canvas.width = this.canvas.width // Setting canvas width will clear it

    const polygon = this.state.polygon

    // Early exit if polygon isn't set
    if (!polygon.length || !polygon[0].length) return

    const ctx = this.canvas.getContext('2d')
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

  render () {
    if (this.props.enabled === false) return null

    return (
      <div id="debug-hover-polygon">
        <canvas
          width={this.state.width}
          height={this.state.height}
          ref={(ref) => { this.canvas = ref }}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    enabled: state.debug.hoverPolygon
  }
}

export default connect(mapStateToProps)(DebugHoverPolygon)
