import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getSegmentVariantInfo } from './info'
import { drawSegmentContents, getVariantInfoDimensions } from './view'
import { TILE_SIZE } from './constants'

const SEGMENT_Y_OFFSET = 265
const CANVAS_HEIGHT = 480
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

class SegmentCanvas extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    forPalette: PropTypes.bool,
    randSeed: PropTypes.number,
    multiplier: PropTypes.number,
    offsetTop: PropTypes.number,
    dpi: PropTypes.number
  }

  static defaultProps = {
    multiplier: 1,
    offsetTop: SEGMENT_Y_OFFSET
  }

  constructor (props) {
    super(props)

    this.state = {
      error: null
    }

    this.canvasEl = React.createRef()
  }

  componentDidMount () {
    this.drawSegment()
  }

  componentDidUpdate (prevProps) {
    if (!this.props.forPalette) {
      this.drawSegment()
    }
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

    drawSegmentContents(ctx, this.props.type, this.props.variantString, this.props.width, 0, this.props.offsetTop, this.props.randSeed, this.props.multiplier, this.props.forPalette)
  }

  render () {
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const dimensions = getVariantInfoDimensions(variantInfo, this.props.width, this.props.multiplier)
    const totalWidth = dimensions.right - dimensions.left

    const canvasWidth = this.props.forPalette ? this.props.width * this.props.dpi : totalWidth * TILE_SIZE * this.props.dpi
    const canvasHeight = CANVAS_BASELINE * this.props.dpi
    const canvasStyle = {
      width: this.props.forPalette ? this.props.width : totalWidth * TILE_SIZE,
      height: CANVAS_BASELINE,
      left: (dimensions.left * TILE_SIZE * this.props.multiplier)
    }

    return (
      <canvas className="image" ref={this.canvasEl} width={canvasWidth} height={canvasHeight} style={canvasStyle} />
    )
  }
}

function mapStateToProps (state) {
  return {
    dpi: state.system.hiDpi,
    redrawCanvas: state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  }
}

export default connect(mapStateToProps)(SegmentCanvas)
