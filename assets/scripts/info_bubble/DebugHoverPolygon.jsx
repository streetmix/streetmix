import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class DebugHoverPolygon extends React.Component {
  static propTypes = {
    enabled: PropTypes.bool,
    hoverPolygon: PropTypes.array
  }

  static defaultProps = {
    enabled: false,
    hoverPolygon: []
  }

  constructor (props) {
    super(props)

    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.canvas = null
  }

  componentDidMount () {
    window.addEventListener('resize', this.updateDimensions)
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

  drawPolygon = () => {
    if (this.props.enabled === false) return
    if (!this.canvas) return

    this.canvas.width = this.canvas.width // Setting canvas width will clear it

    const polygon = this.props.hoverPolygon

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
    enabled: state.debug.hoverPolygon,
    hoverPolygon: state.infoBubble.hoverPolygon
  }
}

export default connect(mapStateToProps)(DebugHoverPolygon)
