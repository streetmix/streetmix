/**
 * StreetView.jsx
 *
 * Renders the street view.
 *
 * @module StreetView
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetEditable from './StreetEditable'
import StreetViewDirt from './StreetViewDirt'
import SkyBackground from './SkyBackground'
import ScrollIndicators from './ScrollIndicators'
import Building from '../segments/Building'
import ResizeGuides from '../segments/ResizeGuides'
import EmptySegmentContainer from '../segments/EmptySegmentContainer'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/constants'
import { BUILDING_SPACE } from '../segments/buildings'
import { TILE_SIZE, DRAGGING_TYPE_RESIZE } from '../segments/constants'
import { updateStreetMargin } from '../segments/resizing'
import './StreetView.scss'

const SEGMENT_RESIZED = 1
const STREETVIEW_RESIZED = 2

class StreetView extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.object.isRequired,
    system: PropTypes.object.isRequired,
    draggingType: PropTypes.number
  }

  static defaultProps = {
    readOnly: false
  }

  constructor (props) {
    super(props)

    this.state = {
      isStreetScrolling: false,
      scrollIndicatorsLeft: 0,
      scrollIndicatorsRight: 0,

      scrollTop: 0,
      skyHeight: 0,

      resizeType: null,
      buildingWidth: 0
    }

    this.streetSectionEl = React.createRef()
  }

  componentDidMount () {
    const resizeState = this.onResize()
    const scrollIndicators = this.calculateScrollIndicators()

    this.setState({
      ...resizeState,
      ...scrollIndicators
    })
  }

  componentDidUpdate (prevProps, prevState) {
    const { viewportWidth, viewportHeight } = this.props.system

    if (prevProps.system.viewportWidth !== viewportWidth ||
        prevProps.system.viewportHeight !== viewportHeight ||
        prevProps.street.width !== this.props.street.width) {
      const resizeState = this.onResize()
      const scrollIndicators = this.calculateScrollIndicators()

      // We are permitted one setState in componentDidUpdate if
      // it's inside of a condition, like it is now.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        ...resizeState,
        ...scrollIndicators
      })
    }

    // Two cases where scrollLeft might have to be updated:
    // 1) Building width has changed due to segments being dragged in/out of StreetView or being resized
    // 2) Street width changed causing remainingWidth to change, but not building width
    if ((prevState.buildingWidth !== this.state.buildingWidth) ||
        (prevState.resizeType === STREETVIEW_RESIZED && !this.state.resizeType)) {
      const deltaX = this.state.buildingWidth - prevState.buildingWidth

      // If segment was resized (either dragged or incremented), update scrollLeft to make up for margin change.
      if (prevState.resizeType === SEGMENT_RESIZED || prevState.resizeType === this.state.resizeType) {
        this.updateScrollLeft(deltaX)
      } else if (prevState.resizeType === STREETVIEW_RESIZED) {
        // If StreetView was resized/changed (either viewport, streetWidth, or street itself),
        // update scrollLeft to center street view and check if margins need to be updated.
        this.updateScrollLeft()
        this.resizeStreetExtent(SEGMENT_RESIZED, true)
      }
    }

    // Updating margins when segment is resized by dragging is handled in resizing.js
    if (prevProps.street.occupiedWidth !== this.props.street.occupiedWidth &&
        this.props.draggingType !== DRAGGING_TYPE_RESIZE) {
      // Check if occupiedWidth changed because segment was changed (resized, added, or removed)
      // or because gallery street was changed, and update accordingly.
      const resizeType = (this.props.street.id !== prevProps.street.id) ? STREETVIEW_RESIZED : SEGMENT_RESIZED
      const dontDelay = (resizeType === STREETVIEW_RESIZED)
      this.resizeStreetExtent(resizeType, dontDelay)
    }
  }

  resizeStreetExtent = (resizeType, dontDelay) => {
    const marginUpdated = updateStreetMargin(this.streetSectionCanvas, this.streetSectionEl.current, dontDelay)

    if (marginUpdated) {
      this.setState({ resizeType: resizeType })
    }
  }

  updateScrollLeft = (deltaX) => {
    let scrollLeft = this.streetSectionEl.current.scrollLeft

    if (deltaX) {
      scrollLeft += deltaX
    } else {
      const streetWidth = this.props.street.width * TILE_SIZE
      const currBuildingSpace = (this.state.buildingWidth) ? (this.state.buildingWidth) : BUILDING_SPACE
      scrollLeft = (streetWidth + (currBuildingSpace * 2) - this.props.system.viewportWidth) / 2
    }

    this.streetSectionEl.current.scrollLeft = scrollLeft
  }

  onResize = () => {
    const { viewportWidth, viewportHeight } = this.props.system
    let streetSectionTop
    let streetSectionHeight = this.streetSectionInner.offsetHeight

    if (viewportHeight - streetSectionHeight > 450) {
      streetSectionTop = ((viewportHeight - streetSectionHeight - 450) / 2) + 450 + 80
    } else {
      streetSectionTop = viewportHeight - streetSectionHeight + 70
    }

    if (this.props.readOnly) {
      streetSectionTop += 80
    }

    let scrollTop = (streetSectionTop + streetSectionHeight)

    // Not sure what 255 does, but it keeps it from getting too tall
    // `skyHeight` is needed so that when gallery opens and the
    // street slides down, there is some more sky to show
    let skyHeight = streetSectionTop - 255
    if (skyHeight < 0) {
      skyHeight = 0
    }
    // 605 is tweaked by adding 10 to 595px, the value of $canvas-baseline in CSS.
    // TODO: consolidate hardcoded numbers
    skyHeight += 605

    const streetWidth = (this.props.street.width * TILE_SIZE)
    let streetSectionCanvasLeft =
      ((viewportWidth - streetWidth) / 2) - BUILDING_SPACE
    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0
    }

    this.streetSectionCanvas.style.width = streetWidth + 'px'
    this.streetSectionCanvas.style.left = streetSectionCanvasLeft + 'px'
    this.streetSectionInner.style.top = streetSectionTop + 'px'

    return {
      scrollTop,
      skyHeight,
      resizeType: STREETVIEW_RESIZED
    }
  }

  /**
   * Event handler for street scrolling.
   */
  handleStreetScroll = (event) => {
    infoBubble.suppress()

    // Place all scroll-based positioning effects inside of a "raf"
    // callback for better performance.
    window.requestAnimationFrame(() => {
      const scrollIndicators = this.calculateScrollIndicators()

      this.setState({
        ...scrollIndicators,
        scrollPos: this.getStreetScrollPosition()
      })
    })
  }

  /**
   * Based on street width and scroll position, determine how many
   * left and right "scroll indicator" arrows to display. This number
   * is calculated as the street scrolls and stored in state.
   */
  calculateScrollIndicators = () => {
    const el = this.streetSectionEl.current
    let scrollIndicatorsLeft
    let scrollIndicatorsRight

    if (el.scrollWidth <= el.offsetWidth) {
      scrollIndicatorsLeft = 0
      scrollIndicatorsRight = 0
    } else {
      const left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

      // TODO const off max width street
      let posMax = Math.round(this.props.street.width / MAX_CUSTOM_STREET_WIDTH * 6)
      if (posMax < 2) {
        posMax = 2
      }

      scrollIndicatorsLeft = Math.round(posMax * left)
      if ((left > 0) && (scrollIndicatorsLeft === 0)) {
        scrollIndicatorsLeft = 1
      }
      if ((left < 1.0) && (scrollIndicatorsLeft === posMax)) {
        scrollIndicatorsLeft = posMax - 1
      }
      scrollIndicatorsRight = posMax - scrollIndicatorsLeft
    }

    return {
      scrollIndicatorsLeft: scrollIndicatorsLeft,
      scrollIndicatorsRight: scrollIndicatorsRight
    }
  }

  scrollStreet = (left, far = false) => {
    const el = this.streetSectionEl.current
    let newScrollLeft

    if (left) {
      if (far) {
        newScrollLeft = 0
      } else {
        newScrollLeft = el.scrollLeft - (el.offsetWidth * 0.5)
      }
    } else {
      if (far) {
        newScrollLeft = el.scrollWidth - el.offsetWidth
      } else {
        newScrollLeft = el.scrollLeft + (el.offsetWidth * 0.5)
      }
    }

    animate(el, { scrollLeft: newScrollLeft }, 300)
  }

  setBuildingWidth = (el) => {
    const pos = getElAbsolutePos(el)

    let width = pos[0]
    if (width < 0) {
      width = 0
    }

    this.setState({
      buildingWidth: width,
      resizeType: null
    })
  }

  getStreetScrollPosition = () => {
    return (this.streetSectionEl.current && this.streetSectionEl.current.scrollLeft) || 0
  }

  /**
   * Updates a segment or building's CSS `perspective-origin` property according
   * to its current position in the street and on the screen, which is used
   * when it animates in or out. Because this reads and writes to DOM, only call
   * this function after a render. Do not set state or call other side effects
   * from this function.
   *
   * @params (HTMLElement) - the element to apply CSS to
   */
  updatePerspective = (el) => {
    if (!el) return

    const pos = getElAbsolutePos(el)
    const scrollPos = this.getStreetScrollPosition()
    const perspective = -(pos[0] - scrollPos - (this.props.system.viewportWidth / 2))

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'
  }

  render () {
    return (
      <React.Fragment>
        <section
          id="street-section-outer"
          onScroll={this.handleStreetScroll}
          ref={this.streetSectionEl}
        >
          <section id="street-section-inner" ref={(ref) => { this.streetSectionInner = ref }}>
            <section id="street-section-canvas" ref={(ref) => { this.streetSectionCanvas = ref }}>
              <Building
                position="left"
                buildingWidth={this.state.buildingWidth}
                updatePerspective={this.updatePerspective}
              />
              <Building
                position="right"
                buildingWidth={this.state.buildingWidth}
                updatePerspective={this.updatePerspective}
              />
              <StreetEditable
                resizeType={this.state.resizeType}
                setBuildingWidth={this.setBuildingWidth}
                updatePerspective={this.updatePerspective}
                draggingType={this.props.draggingType}
              />
              <ResizeGuides />
              <EmptySegmentContainer />
              <StreetViewDirt buildingWidth={this.state.buildingWidth} />
            </section>
          </section>
        </section>
        <SkyBackground
          scrollPos={this.state.scrollPos}
          height={this.state.skyHeight}
        />
        <ScrollIndicators
          scrollIndicatorsLeft={this.state.scrollIndicatorsLeft}
          scrollIndicatorsRight={this.state.scrollIndicatorsRight}
          scrollStreet={this.scrollStreet}
          scrollTop={this.state.scrollTop}
        />
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    readOnly: state.app.readOnly,
    street: state.street,
    system: state.system,
    draggingType: state.ui.draggingType
  }
}

export default connect(mapStateToProps)(StreetView)
