import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import MeasurementText from '../ui/MeasurementText'
import SegmentCanvas from './SegmentCanvas'
import { CSSTransition } from 'react-transition-group'
import { getSegmentVariantInfo, getSegmentInfo } from '../segments/info'
import { normalizeSegmentWidth, RESIZE_TYPE_INITIAL, suppressMouseEnter, incrementSegmentWidth } from './resizing'
import { TILE_SIZE } from './constants'
import { SETTINGS_UNITS_METRIC } from '../users/constants'
import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { KEYS } from '../app/keyboard_commands'
import { trackEvent } from '../app/event_tracking'
import { t } from '../locales/locale'

class Segment extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired,
    randSeed: PropTypes.number,
    isUnmovable: PropTypes.bool.isRequired,
    width: PropTypes.number,
    forPalette: PropTypes.bool.isRequired,
    dpi: PropTypes.number,
    cssTransform: PropTypes.string,
    units: PropTypes.number,
    segmentPos: PropTypes.number,
    dataNo: PropTypes.number,
    updateSegmentData: PropTypes.func,
    updatePerspective: PropTypes.func,
    locale: PropTypes.string,
    suppressMouseEnter: PropTypes.bool.isRequired
  }

  static defaultProps = {
    units: SETTINGS_UNITS_METRIC,
    suppressMouseEnter: false
  }

  constructor (props) {
    super(props)

    this.state = {
      switchSegments: false,
      oldVariant: props.variantString
    }
  }

  componentDidMount = () => {
    if (!this.props.forPalette) {
      this.dragHandleLeft.segmentEl = this.streetSegment
      this.dragHandleRight.segmentEl = this.streetSegment
      this.props.updateSegmentData(this.streetSegment, this.props.dataNo, this.props.segmentPos)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.forPalette) return

    if (prevProps.suppressMouseEnter && !this.props.suppressMouseEnter &&
        infoBubble.considerSegmentEl === this.streetSegment) {
      infoBubble.considerShowing(false, this.streetSegment, INFO_BUBBLE_TYPE_SEGMENT)
    }

    if (prevProps.variantString && prevProps.variantString !== this.props.variantString) {
      this.switchSegments(prevProps.variantString)
    }

    if (!prevState.switchSegments && this.state.switchSegments) {
      console.log(this.oldSegmentCanvas)
    }

    this.props.updateSegmentData(this.streetSegment, this.props.dataNo, this.props.segmentPos)
  }

  switchSegments = (oldVariant) => {
    this.setState({
      switchSegments: !(this.state.switchSegments),
      oldVariant: (this.state.switchSegments) ? this.props.variantString : oldVariant
    })
  }

  calculateSegmentWidths = (resizeType) => {
    let widthValue = this.props.width / TILE_SIZE
    if (!this.props.forPalette) {
      widthValue = normalizeSegmentWidth(widthValue, resizeType)
    }

    return {
      widthValue,
      width: widthValue * TILE_SIZE
    }
  }

  onSegmentMouseEnter = (event) => {
    if (this.props.suppressMouseEnter || suppressMouseEnter() || this.props.forPalette) return

    window.addEventListener('keydown', this.handleKeyDown)
    infoBubble.considerShowing(event, this.streetSegment, INFO_BUBBLE_TYPE_SEGMENT)
  }

  onSegmentMouseLeave = () => {
    window.removeEventListener('keydown', this.handleKeyDown)
    infoBubble.dontConsiderShowing()
  }

  handleKeyDown = (event) => {
    const negative = (event.keyCode === KEYS.MINUS) ||
      (event.keyCode === KEYS.MINUS_ALT) ||
      (event.keyCode === KEYS.MINUS_KEYPAD)

    const positive = (event.keyCode === KEYS.EQUAL) ||
      (event.keyCode === KEYS.EQUAL_ALT) ||
      (event.keyCode === KEYS.PLUS_KEYPAD)

    const metaCtrlAlt = (event.metaKey || event.ctrlKey || event.altKey)
    if (metaCtrlAlt || (!negative && !positive)) return

    const { widthValue } = this.calculateSegmentWidths(RESIZE_TYPE_INITIAL)
    incrementSegmentWidth(this.props.dataNo, !negative, event.shiftKey, widthValue)
    event.preventDefault()

    trackEvent('INTERACTION', 'CHANGE_WIDTH', 'KEYBOARD', null, true)
  }

  render () {
    const segmentInfo = getSegmentInfo(this.props.type)
    const variantInfo = getSegmentVariantInfo(this.props.type, this.props.variantString)
    const defaultName = variantInfo.name || segmentInfo.name // the name to display if there isn't a localized version of it
    const nameKey = variantInfo.nameKey || segmentInfo.nameKey

    // Get localized names from store, fall back to segment default names if translated
    // text is not found. TODO: port to react-intl/formatMessage later.
    const displayName = t(`segments.${nameKey}`, defaultName, { ns: 'segment-info' })
    const localizedSegmentName = t(`segments.${segmentInfo.nameKey}`, defaultName, { ns: 'segment-info' })

    const segmentWidths = this.calculateSegmentWidths(RESIZE_TYPE_INITIAL)
    const { width, widthValue } = segmentWidths

    const segmentStyle = {
      width: width + 'px',
      // In a street, certain segments have stacking priority over others (expressed as z-index).
      // In a palette, segments are side-by-side so they don't need stacking priority.
      // Setting a z-index here will clobber a separate z-index (applied via CSS) when hovered by mouse pointer
      zIndex: (this.props.forPalette) ? null : segmentInfo.zIndex,
      [this.props.cssTransform]: (this.props.forPalette) ? null : 'translateX(' + this.props.segmentPos + 'px)'
    }

    const dataAttributes = {
      type: this.props.type,
      'variant-string': this.props.variantString,
      'rand-seed': this.props.randSeed,
      'data-width': widthValue
    }

    return (
      <div
        style={segmentStyle}
        className={'segment' + (this.props.isUnmovable ? ' unmovable' : '') + (this.props.forPalette ? ' segment-in-palette' : '')}
        {...dataAttributes}
        title={this.props.forPalette ? localizedSegmentName : null}
        ref={(ref) => { this.streetSegment = ref }}
        onMouseEnter={this.onSegmentMouseEnter}
        onMouseLeave={this.onSegmentMouseLeave}
      >
        {!this.props.forPalette &&
          <React.Fragment>
            <span className="name">
              {displayName}
            </span>
            <span className="width">
              <MeasurementText value={widthValue} units={this.props.units} locale={this.props.locale} />
            </span>
            <span className="drag-handle left" ref={(ref) => { this.dragHandleLeft = ref }}>‹</span>
            <span className="drag-handle right" ref={(ref) => { this.dragHandleRight = ref }}>›</span>
            <span className={'grid' + (this.props.units === SETTINGS_UNITS_METRIC ? ' units-metric' : ' units-imperial')} />
          </React.Fragment>
        }
        <CSSTransition
          key="old-variant"
          in={!this.state.switchSegments}
          classNames="switching-away"
          timeout={250}
          onExit={(node) => { console.log(node) }}
          onExited={() => { this.switchSegments(this.props.variantString) }}
          unmountOnExit
        >
          <SegmentCanvas
            width={width}
            type={this.props.type}
            variantString={this.state.oldVariant}
            forPalette={this.props.forPalette}
            randSeed={this.props.randSeed}
            ref={(ref) => { this.oldSegmentCanvas = ref }}
          />
        </CSSTransition>
        { !this.props.forPalette &&
          <CSSTransition
            key="new-variant"
            in={this.state.switchSegments}
            classNames="switching-in"
            timeout={250}
            unmountOnExit
          >
            <SegmentCanvas
              width={width}
              type={this.props.type}
              variantString={this.props.variantString}
              forPalette={this.props.forPalette}
              randSeed={this.props.randSeed}
              ref={this.newSegmentCanvas}
            />
          </CSSTransition>
        }
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    dpi: state.system.hiDpi,
    cssTransform: state.system.cssTransform,
    locale: state.locale.locale,
    redrawCanvas: state.flags.DEBUG_SEGMENT_CANVAS_RECTANGLES.value
  }
}

export default connect(mapStateToProps)(Segment)
