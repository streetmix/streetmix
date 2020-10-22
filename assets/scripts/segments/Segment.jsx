import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { DragSource, DropTarget } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import flow from 'lodash/flow'
import { CSSTransition } from 'react-transition-group'
import { getSegmentCapacity } from '../util/street_analytics'
import SegmentCanvas from './SegmentCanvas'
import SegmentDragHandles from './SegmentDragHandles'
import SegmentLabelContainer from './SegmentLabelContainer'
import { getLocaleSegmentName } from '../segments/view'

import {
  TILE_SIZE,
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from './constants'
import {
  Types,
  segmentSource,
  collectDragSource,
  segmentTarget,
  collectDropTarget,
  _getBugfix,
  _resetBugfix
} from './drag_and_drop'
import { getSegmentInfo } from './info'
import {
  normalizeSegmentWidth,
  resolutionForResizeType,
  RESIZE_TYPE_INITIAL,
  RESIZE_TYPE_INCREMENT
} from './resizing'
import { infoBubble } from '../info_bubble/info_bubble'
import { INFO_BUBBLE_TYPE_SEGMENT } from '../info_bubble/constants'
import { formatMessage } from '../locales/locale'
import { setActiveSegment } from '../store/slices/ui'
import {
  incrementSegmentWidth,
  removeSegmentAction,
  clearSegmentsAction
} from '../store/actions/street'
import { addToast } from '../store/slices/toasts'
import './Segment.scss'

export class Segment extends React.Component {
  static propTypes = {
    // Provided by parent
    dataNo: PropTypes.number,
    enableAnalytics: PropTypes.bool,
    segment: PropTypes.object.isRequired,
    actualWidth: PropTypes.number.isRequired,
    units: PropTypes.number,
    segmentPos: PropTypes.number,
    updateSegmentData: PropTypes.func,
    updatePerspective: PropTypes.func,

    // Provided by store
    locale: PropTypes.string,
    descriptionVisible: PropTypes.bool,
    activeSegment: PropTypes.number,
    setActiveSegment: PropTypes.func,
    incrementSegmentWidth: PropTypes.func,
    removeSegmentAction: PropTypes.func,
    clearSegmentsAction: PropTypes.func,
    addToast: PropTypes.func,

    // Provided by react-dnd DragSource and DropTarget
    connectDragSource: PropTypes.func,
    connectDragPreview: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isDragging: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.initialRender = true

    this.state = {
      switchSegments: false,
      oldVariant: props.segment.variantString
    }
  }

  componentDidMount = () => {
    this.props.updateSegmentData(
      this.streetSegment,
      this.props.dataNo,
      this.props.segmentPos
    )

    this.props.connectDragPreview(getEmptyImage(), {
      captureDraggingState: true
    })
  }

  componentDidUpdate (prevProps, prevState) {
    // TODO: there should be checks if the calls to the prop methods should be made in the first place. see discussion here: https://github.com/streetmix/streetmix/pull/1227#discussion_r263536187
    // During a segment removal or a dragging action, the infoBubble temporarily does not appear
    // for the hovered/dragged segment. Once the removal or drag action ends, the infoBubble for
    // the active segment should be shown. The following IF statement checks to see if a removal
    // or drag action occurred previously to this segment and displays the infoBubble for the
    // segment if it is equal to the activeSegment and no infoBubble was shown already.
    const wasDragging =
      (prevProps.isDragging && !this.props.isDragging) ||
      (this.initialRender &&
        (this.props.activeSegment || this.props.activeSegment === 0))

    this.initialRender = false

    if (wasDragging && this.props.activeSegment === this.props.dataNo) {
      infoBubble.considerShowing(
        false,
        this.streetSegment,
        INFO_BUBBLE_TYPE_SEGMENT
      )
    }

    if (
      prevProps.segment.variantString &&
      prevProps.segment.variantString !== this.props.segment.variantString
    ) {
      this.handleSwitchSegments(prevProps.segment.variantString)
    }

    this.props.updateSegmentData(
      this.streetSegment,
      this.props.dataNo,
      this.props.segmentPos
    )
  }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleSwitchSegments = (oldVariant) => {
    this.setState({
      switchSegments: !this.state.switchSegments,
      oldVariant: this.state.switchSegments
        ? this.props.segment.variantString
        : oldVariant
    })
  }

  calculateSegmentWidths = () => {
    let actualWidth = this.props.actualWidth

    actualWidth = normalizeSegmentWidth(
      actualWidth,
      resolutionForResizeType(RESIZE_TYPE_INITIAL, this.props.units)
    )

    return actualWidth
  }

  handleSegmentMouseEnter = (event) => {
    // Immediately after a segment move action, react-dnd can incorrectly trigger this handler
    // on the segment that exists in the previous segment's spot. The bug is tracked here
    // (https://github.com/streetmix/streetmix/pull/1262) and here (https://github.com/react-dnd/react-dnd/issues/1102).
    // We work around this by setting `__BUGFIX_SUPPRESS_WRONG_MOUSEENTER_HANDLER` to `true`
    // immediately after the move action, which prevents us from firing this event handler one
    // time. This is suppressed once, then reset.
    if (_getBugfix() === true) {
      _resetBugfix()
      return
    }

    this.props.setActiveSegment(this.props.dataNo)

    document.addEventListener('keydown', this.handleKeyDown)
    infoBubble.considerShowing(
      event,
      this.streetSegment,
      INFO_BUBBLE_TYPE_SEGMENT
    )
  }

  handleSegmentMouseLeave = () => {
    document.removeEventListener('keydown', this.handleKeyDown)
    infoBubble.dontConsiderShowing()
  }

  renderSegmentCanvas = (variantType) => {
    const isOldVariant = variantType === 'old'
    const { segment, connectDragSource, connectDropTarget } = this.props

    // The segment ID is a string that uniquely identifies the segment
    // and can be used as a consistent and reliable seed for a PRNG
    const randSeed = segment.id

    return connectDragSource(
      connectDropTarget(
        <div className="segment-canvas-container">
          <SegmentCanvas
            actualWidth={this.props.actualWidth}
            type={segment.type}
            variantString={
              isOldVariant ? this.state.oldVariant : segment.variantString
            }
            randSeed={randSeed}
            updatePerspective={this.props.updatePerspective}
          />
        </div>
      )
    )
  }

  /**
   * Decreases segment width
   *
   * @param {Number} position - segment position
   * @param {Boolean} finetune - true if shift key is pressed
   */
  decrementSegmentWidth (position, finetune) {
    this.props.incrementSegmentWidth(
      position,
      false,
      finetune,
      this.props.actualWidth,
      RESIZE_TYPE_INCREMENT
    )
  }

  /**
   * Increases segment width
   *
   * @param {Number} position - segment position
   * @param {Boolean} finetune - true if shift key is pressed
   */
  incrementSegmentWidth (position, finetune) {
    this.props.incrementSegmentWidth(
      position,
      true,
      finetune,
      this.props.actualWidth,
      RESIZE_TYPE_INCREMENT
    )
  }

  handleKeyDown = (event) => {
    switch (event.key) {
      case '-':
        if (event.metaKey || event.ctrlKey || event.altKey) return

        event.preventDefault()
        this.decrementSegmentWidth(this.props.dataNo, event.shiftKey)
        break
      // Plus (+) may only triggered with shift key, so also check if
      // the same physical key (Equal) is pressed
      case '+':
      case '=':
        if (event.metaKey || event.ctrlKey || event.altKey) return

        event.preventDefault()
        this.incrementSegmentWidth(this.props.dataNo, event.shiftKey)
        break
      case 'Backspace':
      case 'Delete':
        // Prevent deletion from occurring if the description is visible
        if (this.props.descriptionVisible) return

        // If the shift key is pressed, we remove all segments
        if (event.shiftKey === true) {
          this.props.clearSegmentsAction()
          infoBubble.hide()
          this.props.addToast({
            message: formatMessage(
              'toast.all-segments-deleted',
              'All segments have been removed.'
            ),
            component: 'TOAST_UNDO'
          })
        } else {
          infoBubble.hide()
          infoBubble.hideSegment()
          this.props.addToast({
            message: formatMessage(
              'toast.segment-deleted',
              'The segment has been removed.'
            ),
            component: 'TOAST_UNDO'
          })
          this.props.removeSegmentAction(this.props.dataNo, false)
        }
        break
      default:
        break
    }
  }

  render () {
    const { segment, enableAnalytics = true } = this.props

    const segmentInfo = getSegmentInfo(segment.type)

    // Get localized names from store, fall back to segment default names if translated
    // text is not found. TODO: port to react-intl/formatMessage later.
    const displayName =
      segment.label || getLocaleSegmentName(segment.type, segment.variantString)

    const {
      capacity: { average, display = true }
    } = getSegmentCapacity(segment)
    const showCapacity = enableAnalytics && display
    const actualWidth = this.calculateSegmentWidths()
    const elementWidth = actualWidth * TILE_SIZE
    const translate = 'translateX(' + this.props.segmentPos + 'px)'

    const segmentStyle = {
      width: elementWidth + 'px',
      // In a street, certain segments have stacking priority over others (expressed as z-index).
      // Setting a z-index here will clobber a separate z-index (applied via CSS) when hovered by mouse pointer
      zIndex: this.props.isDragging ? 0 : segmentInfo.zIndex,
      WebkitTransform: translate,
      transform: translate
    }

    const classNames = ['segment']

    if (this.props.isDragging) {
      classNames.push('dragged-out')
    } else if (this.props.activeSegment === this.props.dataNo) {
      classNames.push('hover', 'show-drag-handles')
    }

    // Palette segments don't have `segment` defined
    if (segment && segment.warnings) {
      if (
        segment.warnings[SEGMENT_WARNING_OUTSIDE] ||
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL] ||
        segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]
      ) {
        classNames.push('warning')
      }
      if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
        classNames.push('outside')
      }
    }

    return (
      <div
        style={segmentStyle}
        className={classNames.join(' ')}
        data-testid="segment"
        ref={(ref) => {
          this.streetSegment = ref
        }}
        onMouseEnter={this.handleSegmentMouseEnter}
        onMouseLeave={this.handleSegmentMouseLeave}
      >
        <SegmentLabelContainer
          label={displayName}
          width={actualWidth}
          units={this.props.units}
          locale={this.props.locale}
          capacity={average}
          showCapacity={showCapacity}
        />
        <SegmentDragHandles width={elementWidth} />
        <CSSTransition
          key="old-variant"
          in={!this.state.switchSegments}
          classNames="switching-away"
          timeout={250}
          onExited={this.handleSwitchSegments}
          unmountOnExit={true}
        >
          {this.renderSegmentCanvas('old')}
        </CSSTransition>
        <CSSTransition
          key="new-variant"
          in={this.state.switchSegments}
          classNames="switching-in"
          timeout={250}
          unmountOnExit={true}
        >
          {this.renderSegmentCanvas('new')}
        </CSSTransition>
        <div className="hover-bk" />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    enableAnalytics: state.flags.ANALYTICS.value && state.street.showAnalytics,
    locale: state.locale.locale,
    descriptionVisible: state.infoBubble.descriptionVisible,
    activeSegment:
      typeof state.ui.activeSegment === 'number' ? state.ui.activeSegment : null
  }
}

const mapDispatchToProps = {
  clearSegmentsAction,
  incrementSegmentWidth,
  removeSegmentAction,
  setActiveSegment,
  addToast
}

export default flow(
  DragSource(Types.SEGMENT, segmentSource, collectDragSource),
  DropTarget(
    [Types.SEGMENT, Types.PALETTE_SEGMENT],
    segmentTarget,
    collectDropTarget
  ),
  connect(mapStateToProps, mapDispatchToProps)
)(Segment)
