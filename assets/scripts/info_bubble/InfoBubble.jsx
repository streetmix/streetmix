import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import debounce from 'just-debounce-it'
import { registerKeypress } from '../app/keypress'
import { BUILDINGS } from '../segments/buildings'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import { getSegmentInfo, getSegmentVariantInfo } from '../segments/info'
import { getSegmentEl } from '../segments/view'
import { loseAnyFocus } from '../util/focus'
import { getElAbsolutePos } from '../util/helpers'
import {
  setInfoBubbleMouseInside,
  updateHoverPolygon
} from '../store/slices/infoBubble'
import EditableLabel from './EditableLabel'
import Triangle from './Triangle'
import RemoveButton from './RemoveButton'
import Variants from './Variants'
import WidthControl from './WidthControl'
import BuildingHeightControl from './BuildingHeightControl'
import Warnings from './Warnings'
import Description from './Description'
import { infoBubble } from './info_bubble'
import {
  INFO_BUBBLE_TYPE_SEGMENT,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from './constants'
import './InfoBubble.scss'

const INFO_BUBBLE_MARGIN_BUBBLE = 20
const INFO_BUBBLE_MARGIN_MOUSE = 10

const DESCRIPTION_HOVER_POLYGON_MARGIN = 200

const MIN_TOP_MARGIN_FROM_VIEWPORT = 150

// The menu bar has extended to 30px margin, but we can't change
// this because a lesser number will currently cause the description
// panel to potentially be offscreen.
const MIN_SIDE_MARGIN_FROM_VIEWPORT = 50

const HOVER_POLYGON_DEBOUNCE = 50

export class InfoBubble extends React.Component {
  static propTypes = {
    // Provided by Redux connect mapStateToProps
    visible: PropTypes.bool.isRequired,
    descriptionVisible: PropTypes.bool,
    mouseInside: PropTypes.bool,
    position: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.oneOf([BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION])
    ]),
    street: PropTypes.object,
    locale: PropTypes.object,

    // Provided by Redux connect mapDispatchToProps
    setInfoBubbleMouseInside: PropTypes.func,
    updateHoverPolygon: PropTypes.func
  }

  static defaultProps = {
    visible: false
  }

  constructor (props) {
    super(props)

    // Stores a ref to the element
    this.el = React.createRef()
    this.segmentEl = getSegmentEl(props.position)
    this.streetOuterEl = null

    this.state = {
      type: null,
      highlightTriangle: false
    }

    // Register keyboard shortcuts to hide info bubble
    // Only hide if it's currently visible, and if the
    // description is NOT visible. (If the description
    // is visible, the escape key should hide that first.)
    registerKeypress(
      'esc',
      {
        condition: () => this.props.visible && !this.props.descriptionVisible
      },
      () => {
        infoBubble.hide()
        infoBubble.hideSegment(false)
      }
    )
  }

  /**
   * Sets state when the infobubble is pointing at a building
   *
   * @param {Object} nextProps
   * @param {Object} prevState
   */
  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.position === BUILDING_LEFT_POSITION) {
      return {
        type: INFO_BUBBLE_TYPE_LEFT_BUILDING
      }
    } else if (nextProps.position === BUILDING_RIGHT_POSITION) {
      return {
        type: INFO_BUBBLE_TYPE_RIGHT_BUILDING
      }
    } else if (Number.isFinite(nextProps.position)) {
      return {
        type: INFO_BUBBLE_TYPE_SEGMENT
      }
    } else {
      return {
        type: null
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
    const wasBuilding = prevState.type !== INFO_BUBBLE_TYPE_SEGMENT

    if (!this.el || !this.el.current) return null

    if (!wasBuilding && this.props.position === BUILDING_RIGHT_POSITION) {
      return window.innerWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    }
    return null
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    this.segmentEl = getSegmentEl(this.props.position)
    this.setInfoBubblePosition()
    this.updateBubbleDimensions(snapshot)

    // Add or remove event listener based on whether infobubble was shown or hidden
    if (prevProps.visible === false && this.props.visible === true) {
      document.body.addEventListener('mousemove', this.handleBodyMouseMove)
    } else if (prevProps.visible === true && this.props.visible === false) {
      document.body.removeEventListener('mousemove', this.handleBodyMouseMove)
    }

    // This appears to be needed to prevent a flicker during mouseover of the infobubble.
    // However because this affects props, it triggers a secondary render() in React and
    // incurs a small performance hit.
    // TODO: can we optimize this away without introducing the flicker?
    this.updateHoverPolygon(
      infoBubble.considerMouseX,
      infoBubble.considerMouseY
    )
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

  // TODO: verify this continues to work with pointer / touch taps
  handleMouseEnter = (event) => {
    this.props.setInfoBubbleMouseInside(true)

    this.updateHoverPolygon()
  }

  handleMouseLeave = (event) => {
    this.props.setInfoBubbleMouseInside(false)

    // Returns focus to body when pointer leaves the info bubble area
    // so that keyboard commands respond to pointer position rather than
    // any focused buttons/inputs
    loseAnyFocus()
  }

  handleBodyMouseMove = (event) => {
    const mouseX = event.pageX
    const mouseY = event.pageY

    if (this.props.visible) {
      if (!infoBubble._withinHoverPolygon(mouseX, mouseY)) {
        infoBubble.show(false)
      }
    }

    this.debouncedUpdateHoverPolygon(mouseX, mouseY)
  }

  handleDescriptionOver = (event) => {
    this.setState({ highlightTriangle: true })
  }

  handleDescriptionOut = (event) => {
    this.setState({ highlightTriangle: false })
  }

  updateHoverPolygon = (mouseX, mouseY) => {
    const hoverPolygon = this.createHoverPolygon(mouseX, mouseY)
    this.props.updateHoverPolygon(hoverPolygon)
  }

  debouncedUpdateHoverPolygon = debounce(
    this.updateHoverPolygon,
    HOVER_POLYGON_DEBOUNCE
  )

  // TODO: make this a pure(r) function
  createHoverPolygon = (mouseX, mouseY) => {
    // `hoverPolygon` is an array of points as [x, y] values. Values should
    // draw a shape counter-clockwise. The final value must match the first
    // value in order to create an enclosed polygon.
    let hoverPolygon = []

    if (!this.props.visible) {
      return hoverPolygon
    }

    // Bail if any reference to an element no longer exists
    if (!this.el || !this.el.current || !this.segmentEl) return

    const bubbleWidth = this.el.current.offsetWidth
    const bubbleHeight = this.el.current.offsetHeight
    const bubbleX = Number.parseInt(this.el.current.style.left)
    const bubbleY = Number.parseInt(this.el.current.style.top)

    if (this.props.mouseInside && !this.props.descriptionVisible) {
      const pos = getElAbsolutePos(this.segmentEl)

      // Left X position of segment element
      const segmentLeftX =
        pos[0] - document.querySelector('#street-section-outer').scrollLeft
      // Right X position of segment element
      const segmentRightX = segmentLeftX + this.segmentEl.offsetWidth
      // Left X position of segment element with margin (edge of the hover polygon)
      const hitboxLeftX = segmentLeftX - INFO_BUBBLE_MARGIN_BUBBLE
      // Right X position of segment element with margin (edge of the hover polygon)
      const hitboxRightX = segmentRightX + INFO_BUBBLE_MARGIN_BUBBLE

      // Top Y position of segment element
      const segmentTopY = pos[1]
      // Bottom Y position of segment element
      const segmentBottomY = segmentTopY + this.segmentEl.offsetHeight
      // Bottom Y position of segment element with margin
      const hitboxBottomY = segmentBottomY + INFO_BUBBLE_MARGIN_BUBBLE

      hoverPolygon = [
        // Top left of infobubble
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Bottom left of infobubble
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Diagonal line to hit edge of segment
        [hitboxLeftX, bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE + 120],
        // Bottom left of segment
        [hitboxLeftX, hitboxBottomY],
        // Bottom right of segment
        [hitboxRightX, hitboxBottomY],
        // Point at which to begin diagonal line to infobubble
        [
          hitboxRightX,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE + 120
        ],
        // Bottom right of infobubble
        [
          bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Top right of infobubble
        [
          bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ],
        // Top left of infobubble (starting point)
        [
          bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
          bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
        ]
      ]
    } else {
      let bottomY = mouseY - INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }
      let bottomY2 = mouseY + INFO_BUBBLE_MARGIN_MOUSE
      if (bottomY2 < bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE) {
        bottomY2 = bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
      }

      if (this.props.descriptionVisible) {
        bottomY =
          bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
        bottomY2 = bottomY

        hoverPolygon = [
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ],
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
          ],
          [
            bubbleX + bubbleWidth + DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY + bubbleHeight + DESCRIPTION_HOVER_POLYGON_MARGIN + 300
          ],
          [
            bubbleX + bubbleWidth + DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ],
          [
            bubbleX - DESCRIPTION_HOVER_POLYGON_MARGIN,
            bubbleY - DESCRIPTION_HOVER_POLYGON_MARGIN
          ]
        ]
      } else {
        let diffX = 60 - (mouseY - bubbleY) / 5
        if (diffX < 0) {
          diffX = 0
        } else if (diffX > 50) {
          diffX = 50
        }

        hoverPolygon = [
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            (bubbleX -
              INFO_BUBBLE_MARGIN_BUBBLE +
              mouseX -
              INFO_BUBBLE_MARGIN_MOUSE -
              diffX) /
              2,
            bottomY +
              (bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE - bottomY) *
                0.2
          ],
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE - diffX, bottomY],
          [mouseX - INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE, bottomY2],
          [mouseX + INFO_BUBBLE_MARGIN_MOUSE + diffX, bottomY],
          [
            (bubbleX +
              bubbleWidth +
              INFO_BUBBLE_MARGIN_BUBBLE +
              mouseX +
              INFO_BUBBLE_MARGIN_MOUSE +
              diffX) /
              2,
            bottomY +
              (bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE - bottomY) *
                0.2
          ],
          [
            bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY + bubbleHeight + INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX + bubbleWidth + INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ],
          [
            bubbleX - INFO_BUBBLE_MARGIN_BUBBLE,
            bubbleY - INFO_BUBBLE_MARGIN_BUBBLE
          ]
        ]
      }
    }

    return hoverPolygon
  }

  /**
   * TODO: consolidate this with the dim calc in updateBubbleDimensions? do we need snapshot here?
   */
  setInfoBubblePosition = () => {
    if (
      !this.segmentEl ||
      !this.el ||
      !this.el.current ||
      !this.props.visible
    ) {
      return
    }

    // Determine dimensions and X/Y layout
    const bubbleWidth = this.el.current.offsetWidth
    const bubbleHeight = this.el.current.offsetHeight
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
    } else if (
      bubbleX >
      window.innerWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    ) {
      bubbleX = window.innerWidth - bubbleWidth - MIN_SIDE_MARGIN_FROM_VIEWPORT
    }

    this.el.current.style.left = bubbleX + 'px'
    this.el.current.style.top = bubbleY + 'px'
  }

  updateBubbleDimensions = (snapshot) => {
    if (!this.el || !this.el.current) return

    let bubbleHeight

    const el = this.el.current.querySelector('.description-canvas')

    if (this.props.descriptionVisible && el) {
      const pos = getElAbsolutePos(el)
      bubbleHeight = pos[1] + el.offsetHeight - 38
    } else {
      bubbleHeight = this.el.current.offsetHeight
    }

    const height = bubbleHeight + 30

    this.el.current.style.webkitTransformOrigin = '50% ' + height + 'px'
    this.el.current.style.MozTransformOrigin = '50% ' + height + 'px'
    this.el.current.style.transformOrigin = '50% ' + height + 'px'

    // When the infoBubble needed to be shown for the right building, the offsetWidth
    // used to calculate the left style was from the previous rendering of this component.
    // This meant that if the last time the infoBubble was shown was for a segment, then the
    // offsetWidth used to calculate the new left style would be smaller than it should be.
    // The current solution is to manually recalculate the left style and set the style
    // when hovering over the right building.

    if (snapshot) {
      const bubbleX = snapshot - this.el.current.offsetWidth
      this.el.current.style.left = bubbleX + 'px'
    }
  }

  /**
   * Retrieve name from segment data. It should also find the equivalent strings from the
   * translation files if provided.
   */
  getLabel = () => {
    let id
    let defaultMessage = ''

    // Return label if provided
    if (this.state.type === INFO_BUBBLE_TYPE_SEGMENT) {
      const segment = this.props.street.segments[this.props.position]
      if (segment && segment.label) {
        return segment.label
      }
    }

    // Otherwise need to do a lookup
    switch (this.state.type) {
      case INFO_BUBBLE_TYPE_SEGMENT: {
        const segment = this.props.street.segments[this.props.position]
        if (segment) {
          const segmentInfo = getSegmentInfo(segment.type)
          const variantInfo = getSegmentVariantInfo(
            segment.type,
            segment.variantString
          )
          const key = variantInfo.nameKey || segmentInfo.nameKey

          id = `segments.${key}`
          defaultMessage = variantInfo.name || segmentInfo.name
        }
        break
      }
      case INFO_BUBBLE_TYPE_LEFT_BUILDING: {
        const key = this.props.street.leftBuildingVariant

        id = `buildings.${key}.name`
        defaultMessage = BUILDINGS[key].label

        break
      }
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING: {
        const key = this.props.street.rightBuildingVariant

        id = `buildings.${key}.name`
        defaultMessage = BUILDINGS[key].label

        break
      }
      default:
        break
    }

    return id
      ? (
        <IntlProvider
          locale={this.props.locale.locale}
          messages={this.props.locale.segmentInfo}
        >
          <FormattedMessage id={id} defaultMessage={defaultMessage} />
        </IntlProvider>
        )
      : null
  }

  render () {
    const type = this.state.type
    const canBeDeleted =
      type === INFO_BUBBLE_TYPE_SEGMENT && this.props.position !== null

    // Set class names
    const classNames = ['info-bubble']

    classNames.push(
      type === INFO_BUBBLE_TYPE_SEGMENT
        ? 'info-bubble-type-segment'
        : 'info-bubble-type-building'
    )
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
        position = this.props.position
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        position = BUILDING_LEFT_POSITION
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        position = BUILDING_RIGHT_POSITION
        break
      default:
        position = null
        break
    }

    // Determine width or height control type
    let widthOrHeightControl
    switch (type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        widthOrHeightControl = <WidthControl position={position} />
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        widthOrHeightControl = <BuildingHeightControl position={position} />
        break
      default:
        widthOrHeightControl = null
        break
    }

    const segment = this.props.street.segments[this.props.position] || {}

    return (
      <div
        className={classNames.join(' ')}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onTouchStart={this.handleTouchStart}
        ref={this.el}
      >
        <Triangle highlight={this.state.highlightTriangle} />
        <header>
          <EditableLabel
            label={this.getLabel()}
            segment={segment}
            position={this.props.position}
          />
          {canBeDeleted && <RemoveButton segment={this.props.position} />}
        </header>
        <div className="info-bubble-controls">
          <IntlProvider
            locale={this.props.locale.locale}
            messages={this.props.locale.segmentInfo}
          >
            <Variants type={type} position={position} />
          </IntlProvider>
          {widthOrHeightControl}
        </div>
        <Warnings segment={segment} />
        <Description
          type={segment.type}
          variantString={segment.variantString}
          updateBubbleDimensions={this.updateBubbleDimensions}
          onMouseOver={this.handleDescriptionOver}
          onMouseOut={this.handleDescriptionOut}
          infoBubbleEl={this.el.current}
          updateHoverPolygon={this.updateHoverPolygon}
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.infoBubble.visible,
    descriptionVisible: state.infoBubble.descriptionVisible,
    mouseInside: state.infoBubble.mouseInside,
    position: state.ui.activeSegment,
    street: state.street,
    system: state.system,
    locale: state.locale
  }
}

const mapDispatchToProps = {
  setInfoBubbleMouseInside,
  updateHoverPolygon
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoBubble)
