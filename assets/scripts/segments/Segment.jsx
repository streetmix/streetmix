import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import MeasurementText from '../ui/MeasurementText'
import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
import { normalizeSegmentWidth, RESIZE_TYPE_INITIAL, suppressMouseEnter } from './resizing'
import { TILE_SIZE } from './constants'
import { drawSegmentContents, getVariantInfoDimensions, segmentsChanged } from './view'
import { SETTINGS_UNITS_METRIC } from '../users/localization'
import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { t } from '../app/locale'

const WIDTH_PALETTE_MULTIPLIER = 4 // Dupe from palette.js
const SEGMENT_Y_NORMAL = 265
const SEGMENT_Y_PALETTE = 20
const CANVAS_HEIGHT = 480
const CANVAS_GROUND = 35
const CANVAS_BASELINE = CANVAS_HEIGHT - CANVAS_GROUND

class Segment extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    randSeed: PropTypes.number,
    isUnmovable: PropTypes.bool.isRequired,
    width: PropTypes.number,
    forPalette: PropTypes.bool.isRequired,
    dpi: PropTypes.number,
    units: PropTypes.number
  }

  static defaultProps = {
    units: SETTINGS_UNITS_METRIC
  }

  constructor (props) {
    super(props)

    this.initialRender = true
  }

  componentDidMount = () => {
    const multiplier = this.props.forPalette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
    const segmentWidth = this.props.width // may need to double check this. setSegmentContents() was called with other widths
    const offsetTop = this.props.forPalette ? SEGMENT_Y_PALETTE : SEGMENT_Y_NORMAL
    const ctx = this.refs.canvas.getContext('2d')
    drawSegmentContents(ctx, this.props.type, this.props.variantString, segmentWidth, 0, offsetTop, this.props.randSeed, multiplier, this.props.forPalette)

    if (this.initialRender) {
      if (!this.props.forPalette) {
        // TODO pretty sure the pointer events aren't working correctly.
        this.refs.canvas.addEventListener('pointerenter', this.onSegmentMouseEnter)
        this.refs.canvas.addEventListener('pointerleave', this.onSegmentMouseLeave)
      }

      this.initialRender = false
    } else {
      segmentsChanged()
    }
  }

  calculateWidth = (resizeType) => {
    let width = this.props.width / TILE_SIZE
    if (!this.props.forPalette) {
      width = normalizeSegmentWidth(width, resizeType)
    }

    // TODO - copied from resizeSegment. make sure we don't need
    // document.body.classList.add('immediate-segment-resize')
    // window.setTimeout(function () {
    //   document.body.classList.remove('immediate-segment-resize')
    // }, SHORT_DELAY)

    width = (width * TILE_SIZE)
    return width
  }

  render () {
    const segmentInfo = getSegmentInfo(this.props.type)
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const defaultName = variantInfo.name || segmentInfo.name // the name to display if there isn't a localized version of it

    // Get localized names from store, fall back to segment default names if translated
    // text is not found. TODO: port to react-intl/formatMessage later.
    const localizedVariantName = t(`segments.${this.props.type}.details.${this.props.variantString}.name`, null, { ns: 'segment-info' })
    const localizedSegmentName = t(`segments.${this.props.type}.name`, defaultName, { ns: 'segment-info' })
    const displayName = localizedVariantName || localizedSegmentName

    const width = this.calculateWidth(RESIZE_TYPE_INITIAL)
    const segmentWidth = this.props.width // may need to double check this. setSegmentContents() was called with other widths

    const multiplier = this.props.forPalette ? (WIDTH_PALETTE_MULTIPLIER / TILE_SIZE) : 1
    const dimensions = getVariantInfoDimensions(variantInfo, segmentWidth, multiplier)
    const totalWidth = dimensions.right - dimensions.left

    // Canvas width and height must fit the div width in the palette to prevent extra right padding
    const canvasWidth = this.props.forPalette ? width * this.props.dpi : totalWidth * TILE_SIZE * this.props.dpi
    const canvasHeight = CANVAS_BASELINE * this.props.dpi
    const canvasStyle = {
      width: this.props.forPalette ? width : totalWidth * TILE_SIZE,
      height: CANVAS_BASELINE,
      left: (dimensions.left * TILE_SIZE * multiplier)
    }

    return (
      <div
        style={{
          width: width,
          // In a street, certain segments have stacking priority over others (expressed as z-index).
          // In a palette, segments are side-by-side so they don't need stacking priority.
          // Setting a z-index here will clobber a separate z-index (applied via CSS) when hovered by mouse pointer
          zIndex: (this.props.forPalette) ? null : segmentInfo.zIndex
        }}
        className={'segment' + (this.props.isUnmovable ? ' unmovable' : '') + (this.props.forPalette ? ' segment-in-palette' : '')}
        data-segment-type={this.props.type}
        data-variant-string={this.props.variantString}
        data-rand-seed={this.props.randSeed}
        data-width={width}
        title={this.props.forPalette ? localizedSegmentName : null}>
        {!this.props.forPalette &&
          <React.Fragment>
            <span className="name">
              {displayName}
            </span>
            <span className="width">
              <MeasurementText value={width} units={this.props.units} />
            </span>
            <span className="drag-handle left">‹</span>
            <span className="drag-handle right">›</span>
            <span className="grid" />
          </React.Fragment>
        }
        <canvas className="image" ref="canvas" width={canvasWidth} height={canvasHeight} style={canvasStyle} />
        <div className="hover-bk" />
      </div>
    )
  }

  onSegmentMouseEnter = (event) => {
    if (suppressMouseEnter()) {
      return
    }

    infoBubble.considerShowing(event, this, INFO_BUBBLE_TYPE_SEGMENT)
  }

  onSegmentMouseLeave = () => {
    infoBubble.dontConsiderShowing()
  }
}

function mapStateToProps (state) {
  return {
    dpi: state.system.hiDpi
  }
}

export default connect(mapStateToProps)(Segment)
