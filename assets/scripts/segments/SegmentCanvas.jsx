import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getSegmentVariantInfo } from './info'
import { drawSegmentContents, getVariantInfoDimensions } from './view'
import { TILE_SIZE } from './constants'
import './SegmentCanvas.scss'

const GROUND_BASELINE = 400
const CANVAS_HEIGHT = 480
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

class SegmentCanvas extends React.PureComponent {
  static propTypes = {
    actualWidth: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    randSeed: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    multiplier: PropTypes.number,
    groundBaseline: PropTypes.number,
    dpi: PropTypes.number,
    updatePerspective: PropTypes.func
  }

  static defaultProps = {
    multiplier: 1,
    groundBaseline: GROUND_BASELINE,
    updatePerspective: () => {}
  }

  constructor (props) {
    super(props)

    this.state = {
      error: null
    }

    this.canvasEl = React.createRef()
  }

  componentDidMount () {
    this.props.updatePerspective(this.canvasEl.current)
    this.drawSegment()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.variantString !== this.props.variantString) {
      this.props.updatePerspective(this.canvasEl.current)
    }

    this.drawSegment()
  }

  componentDidCatch (error, info) {
    this.setState({
      error
    })
  }

  drawSegment = () => {
    const canvas = this.canvasEl.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawSegmentContents(
      ctx,
      this.props.type,
      this.props.variantString,
      this.props.actualWidth,
      0,
      this.props.groundBaseline,
      this.props.randSeed,
      this.props.multiplier,
      this.props.dpi
    )
  }

  render () {
    // Determine the maximum width of the artwork for this segment
    const variantInfo = getSegmentVariantInfo(
      this.props.type,
      this.props.variantString
    )
    const dimensions = getVariantInfoDimensions(
      variantInfo,
      this.props.actualWidth
    )
    const totalWidth = dimensions.right - dimensions.left

    // If the graphics are wider than the width of the segment, then we will draw
    // our canvas a little bigger to make sure that the graphics aren't truncated.
    const displayWidth =
      totalWidth > this.props.actualWidth ? totalWidth : this.props.actualWidth

    // Determine dimensions to draw DOM element
    const elementWidth = displayWidth * TILE_SIZE * this.props.multiplier
    const elementHeight = CANVAS_BASELINE

    // Determine size of canvas
    const canvasWidth = Math.round(elementWidth * this.props.dpi)
    const canvasHeight = elementHeight * this.props.dpi
    const canvasStyle = {
      width: Math.round(elementWidth),
      height: elementHeight,
      left: dimensions.left * TILE_SIZE * this.props.multiplier
    }

    return (
      <canvas
        className="segment-image"
        ref={this.canvasEl}
        width={canvasWidth}
        height={canvasHeight}
        style={canvasStyle}
      />
    )
  }
}

function mapStateToProps (state) {
  return {
    dpi: state.system.devicePixelRatio,
    redrawCanvas: state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  }
}

export default connect(mapStateToProps)(SegmentCanvas)
