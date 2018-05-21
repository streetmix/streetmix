import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Triangle from './Triangle'
import RemoveButton from './RemoveButton'
import Variants from './Variants'
import WidthControl from './WidthControl'
import BuildingHeightControl from './BuildingHeightControl'
import Warnings from './Warnings'
import Description from './Description.jsx'
import { infoBubble } from './info_bubble'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import { registerKeypress } from '../app/keypress'
import { cancelFadeoutControls, resumeFadeoutControls } from '../segments/resizing'
// import { trackEvent } from '../app/event_tracking'
import { BUILDINGS } from '../segments/buildings'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { loseAnyFocus } from '../util/focus'
import { getElAbsolutePos } from '../util/helpers'
import { setInfoBubbleMouseInside, setInfoBubbleDimensions } from '../store/actions/infoBubble'
import { t } from '../app/locale'

const MIN_TOP_MARGIN_FROM_VIEWPORT = 120
const MIN_SIDE_MARGIN_FROM_VIEWPORT = 50

class InfoBubble extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dataNo: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    descriptionVisible: PropTypes.bool,
    setInfoBubbleMouseInside: PropTypes.func,
    setInfoBubbleDimensions: PropTypes.func,
    street: PropTypes.object,
    system: PropTypes.object
  }

  static defaultProps = {
    visible: false
  }

  constructor (props) {
    super(props)

    // Stores a ref to the element
    this.el = null
    this.segmentEl = this.getSegmentEl(props.dataNo)
    this.streetOuterEl = null

    this.state = {
      type: null,
      highlightTriangle: false
    }

    this.hoverPolygonUpdateTimerId = -1

    // Register keyboard shortcuts to hide info bubble
    // Only hide if it's currently visible, and if the
    // description is NOT visible. (If the description
    // is visible, the escape key should hide that first.)
    registerKeypress('esc', {
      condition: () => this.props.visible && !this.props.descriptionVisible
    }, () => {
      infoBubble.hide()
      infoBubble.hideSegment(false)
    })
  }

  /**
   * Sets state when the infobubble is pointing at a building
   *
   * @param {Object} nextProps
   * @param {Object} prevState
   */
  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.dataNo === 'left') {
      return {
        type: INFO_BUBBLE_TYPE_LEFT_BUILDING
      }
    } else if (nextProps.dataNo === 'right') {
      return {
        type: INFO_BUBBLE_TYPE_RIGHT_BUILDING
      }
    } else {
      return {
        type: INFO_BUBBLE_TYPE_SEGMENT
      }
    }
  }

  componentDidMount () {
    // This listener hides the info bubble when the mouse leaves the
    // document area. Do not normalize it to a pointerleave event
    // because it doesn't make sense for other pointer types
    document.addEventListener('mouseleave', this.hide)

    // Cache reference to this element
    this.streetOuterEl = document.querySelector('#street-section-outer')
  }

  getSnapshotBeforeUpdate (prevProps, prevState) {
    const wasBuilding = (prevState.type !== INFO_BUBBLE_TYPE_SEGMENT)
    const isBuilding = (this.state.type !== INFO_BUBBLE_TYPE_SEGMENT)

    if (wasBuilding && !isBuilding) {
      return Number.parseInt(this.el.style.left, 10) + (this.el.offsetWidth / 2)
    } else if (!wasBuilding && this.props.dataNo === 'right') {
      return this.props.system.viewportWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    }
    return null
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    this.segmentEl = this.getSegmentEl(this.props.dataNo)
    this.setBubbleDimensions()

    // If info bubble changes, wake this back up if it's fading out
    cancelFadeoutControls()

    this.updateBubbleDimensions(snapshot)

    // Add or remove event listener based on whether infobubble was shown or hidden
    if (prevProps.visible === false && this.props.visible === true) {
      document.body.addEventListener('mousemove', this.onBodyMouseMove)
    } else if (prevProps.visible === true && this.props.visible === false) {
      document.body.removeEventListener('mousemove', this.onBodyMouseMove)
    }
  }

  componentWillUnmount () {
    // Clean up event listener
    document.removeEventListener('mouseleave', this.hide)
  }

  componentDidCatch (error) {
    console.error(error)
  }

  hide = () => {
    infoBubble.hide()
  }

  onTouchStart (event) {
    resumeFadeoutControls()
  }

  // TODO: verify this continues to work with pointer / touch taps
  onMouseEnter = (event) => {
    // TODO: refactor so segment element handles this
    if (this.segmentEl) {
      this.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble')
    }

    this.props.setInfoBubbleMouseInside(true)

    infoBubble.updateHoverPolygon()
  }

  onMouseLeave = (event) => {
    // TODO: Prevent pointer taps from flashing the drag handles
    // TODO: refactor so segment element handles this
    if (this.segmentEl) {
      this.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble')
    }

    this.props.setInfoBubbleMouseInside(false)

    // Returns focus to body when pointer leaves the info bubble area
    // so that keyboard commands respond to pointer position rather than
    // any focused buttons/inputs
    loseAnyFocus()
  }

  onBodyMouseMove = (event) => {
    const mouseX = event.pageX
    const mouseY = event.pageY

    if (this.props.visible) {
      if (!infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        infoBubble.show(false)
      }
    }

    window.clearTimeout(this.hoverPolygonUpdateTimerId)

    this.hoverPolygonUpdateTimerId = window.setTimeout(() => {
      infoBubble.updateHoverPolygon(mouseX, mouseY)
    }, 50)
  }

  toggleHighlightTriangle = () => {
    this.setState({ highlightTriangle: !this.state.highlightTriangle })
  }

  getSegmentEl (dataNo) {
    if (!dataNo && dataNo !== 0) return

    let segmentEl
    if (dataNo === 'left') {
      segmentEl = document.querySelectorAll('.street-section-building')[0]
    } else if (dataNo === 'right') {
      segmentEl = document.querySelectorAll('.street-section-building')[1]
    } else {
      const segments = document.getElementById('street-section-editable').querySelectorAll('.segment')
      segmentEl = segments[dataNo]
    }
    return segmentEl
  }

  /**
   * TODO: consolidate this with the dim calc in updateBubbleDimensions? do we need snapshot here?
   */
  setBubbleDimensions = () => {
    if (!this.segmentEl || !this.el) return

    // Determine dimensions and X/Y layout
    const bubbleWidth = this.el.offsetWidth
    const bubbleHeight = this.el.offsetHeight
    const pos = getElAbsolutePos(this.segmentEl)

    let bubbleX = pos[0] - this.streetOuterEl.scrollLeft
    let bubbleY = pos[1]

    // TODO const
    bubbleY -= bubbleHeight - 20
    if (bubbleY < MIN_TOP_MARGIN_FROM_VIEWPORT) {
      bubbleY = MIN_TOP_MARGIN_FROM_VIEWPORT
    }

    bubbleX += this.segmentEl.offsetWidth / 2
    bubbleX -= bubbleWidth / 2

    if (bubbleX < MIN_SIDE_MARGIN_FROM_VIEWPORT) {
      bubbleX = MIN_SIDE_MARGIN_FROM_VIEWPORT
    } else if (bubbleX > this.props.system.viewportWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT) {
      bubbleX = this.props.system.viewportWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    }

    this.el.style.left = bubbleX + 'px'
    this.el.style.top = bubbleY + 'px'

    this.props.setInfoBubbleDimensions({
      bubbleX, bubbleY, bubbleWidth, bubbleHeight
    })
  }

  updateBubbleDimensions = (snapshot) => {
    const dims = {}

    if (!this.el) return

    if (this.props.descriptionVisible) {
      const el = this.el.querySelector('.description-canvas')
      const pos = getElAbsolutePos(el)
      dims.bubbleHeight = pos[1] + el.offsetHeight - 38
    } else {
      dims.bubbleHeight = this.el.offsetHeight
    }

    const height = dims.bubbleHeight + 30

    this.el.style.webkitTransformOrigin = '50% ' + height + 'px'
    this.el.style.MozTransformOrigin = '50% ' + height + 'px'
    this.el.style.transformOrigin = '50% ' + height + 'px'

    // When the infoBubble needed to be shown for the right building, the offsetWidth
    // used to calculate the left style was from the previous rendering of this component.
    // This meant that if the last time the infoBubble was shown was for a segment, then the
    // offsetWidth used to calculate the new left style would be smaller than it should be.
    // The current solution is to manually recalculate the left style and set the style
    // when hovering over the right building.

    // Now that street segments are being rendered as React components as well, the same issue
    // as above can be seen but vice versa (when switching between hovering over building to
    // a segment). Some calculations are done by the getSnapshotBeforeUpdate function. The new
    // offsetWidth is then added in this function.

    if (snapshot) {
      const bubbleX = (this.state.type === INFO_BUBBLE_TYPE_SEGMENT)
        ? (snapshot - this.el.offsetWidth / 2) : (snapshot - this.el.offsetWidth)
      dims.bubbleX = bubbleX
      this.el.style.left = bubbleX + 'px'
    }

    this.props.setInfoBubbleDimensions(dims)
  }

  /**
   * Retrieve name from segment data. It should also find the equivalent strings from the
   * translation files if provided.
   */
  getName = () => {
    let name

    switch (this.state.type) {
      case INFO_BUBBLE_TYPE_SEGMENT: {
        const segment = this.props.street.segments[this.props.dataNo]
        if (segment) {
          const segmentName = getSegmentInfo(segment.type).name
          const segmentVariantName = getSegmentVariantInfo(segment.type, segment.variantString).name
          const segmentType = segment.type
          const segmentVariant = segment.variantString

          // Not all variants have custom names. If the custom segment variant name doesn't exist,
          // then it should use the default name for the segment.
          if (segmentVariantName) {
            name = t(`segments.${segmentType}.details.${segmentVariant}.name`, segmentVariantName, { ns: 'segment-info' })
          } else {
            name = t(`segments.${segmentType}.name`, segmentName, { ns: 'segment-info' })
          }
        }
        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING: {
        const variantId = this.props.street.leftBuildingVariant
        const backupName = BUILDINGS[variantId].label
        name = t(`buildings.${variantId}.name`, backupName, { ns: 'segment-info' })
        break
      }
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING: {
        const variantId = this.props.street.rightBuildingVariant
        const backupName = BUILDINGS[variantId].label
        name = t(`buildings.${variantId}.name`, backupName, { ns: 'segment-info' })
        break
      }
      default:
        break
    }

    return name
  }

  render () {
    const type = this.state.type
    const canBeDeleted = (type === INFO_BUBBLE_TYPE_SEGMENT)

    // Set class names
    const classNames = ['info-bubble']

    classNames.push((type === INFO_BUBBLE_TYPE_SEGMENT) ? 'info-bubble-type-segment' : 'info-bubble-type-building')
    if (this.props.visible) {
      classNames.push('visible')
    }
    if (this.props.descriptionVisible) {
      classNames.push('show-description')
    }

    // Determine position
    let position
    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        position = this.props.dataNo
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        position = 'left'
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        position = 'right'
        break
      default:
        position = null
        break
    }

    // Determine width or height control type
    let widthOrHeightControl
    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        widthOrHeightControl = <WidthControl segmentEl={this.segmentEl} position={position} />
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        widthOrHeightControl = <BuildingHeightControl position={position} />
        break
      default:
        widthOrHeightControl = null
        break
    }

    const segment = this.props.street.segments[this.props.dataNo]

    return (
      <div
        className={classNames.join(' ')}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onTouchStart={this.onTouchStart}
        ref={(ref) => { this.el = ref }}
      >
        <Triangle highlight={this.state.highlightTriangle} />
        <header>
          <div className="info-bubble-header-label">{this.getName()}</div>
          <RemoveButton enabled={canBeDeleted} segment={this.segmentEl} />
        </header>
        <div className="info-bubble-controls">
          <Variants type={type} position={position} />
          {widthOrHeightControl}
        </div>
        <Warnings segment={segment} />
        <Description
          segment={segment}
          updateBubbleDimensions={this.updateBubbleDimensions}
          toggleHighlightTriangle={this.toggleHighlightTriangle}
          segmentEl={this.segmentEl}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.infoBubble.visible,
    dataNo: state.infoBubble.dataNo,
    descriptionVisible: state.infoBubble.descriptionVisible,
    street: state.street,
    system: state.system
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setInfoBubbleMouseInside: (value) => { dispatch(setInfoBubbleMouseInside(value)) },
    setInfoBubbleDimensions: (obj) => { dispatch(setInfoBubbleDimensions(obj)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoBubble)
