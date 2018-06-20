import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getSegmentVariantInfo } from './info'
import { drawSegmentContents, getVariantInfoDimensions } from './view'
import { TILE_SIZE, WIDTH_PALETTE_MULTIPLIER } from './constants'

const SEGMENT_Y_NORMAL = 265
const SEGMENT_Y_PALETTE = 20
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
    dpi: PropTypes.number
  }

  componentDidMount () {
    this.drawSegment()
  }

  componentDidUpdate (prevProps) {
    if (!this.props.forPalette) {
      this.drawSegment()
    }
  }

  drawSegment = () => {
    const multiplier = this.props.forPalette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
    const offsetTop = this.props.forPalette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL
    const ctx = this.canvasEl.getContext('2d')
    ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height)
    drawSegmentContents(ctx, this.props.type, this.props.variantString, this.props.width, 0, offsetTop, this.props.randSeed, multiplier, this.props.forPalette)
  }

  render () {
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const multiplier = this.props.forPalette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
    const dimensions = getVariantInfoDimensions(variantInfo, this.props.width, multiplier)
    const totalWidth = dimensions.right - dimensions.left

    const canvasWidth = this.props.forPalette ? this.props.width * this.props.dpi : totalWidth * TILE_SIZE * this.props.dpi
    const canvasHeight = CANVAS_BASELINE * this.props.dpi
    const canvasStyle = {
      width: this.props.forPalette ? this.props.width : totalWidth * TILE_SIZE,
      height: CANVAS_BASELINE,
      left: (dimensions.left * TILE_SIZE * multiplier)
    }

    return (
      <div>
        <canvas className="image" ref={(ref) => { this.canvasEl = ref }} width={canvasWidth} height={canvasHeight} style={canvasStyle} />
        <div className="hover-bk" />
      </div>
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
