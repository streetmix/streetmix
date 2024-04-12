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
import Building from '../segments/Building'
import ResizeGuides from '../segments/ResizeGuides'
import EmptySegmentContainer from '../segments/EmptySegmentContainer'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/constants'
import {
  TILE_SIZE,
  DRAGGING_TYPE_RESIZE,
  BUILDING_SPACE
} from '../segments/constants'
import { updateStreetMargin } from '../segments/resizing'
import SkyBox from '../sky/SkyBox'
import ScrollIndicators from './ScrollIndicators'
import StreetViewDirt from './StreetViewDirt'
import StreetEditable from './StreetEditable'
import './StreetView.scss'

const SEGMENT_RESIZED = 1
const STREETVIEW_RESIZED = 2

class StreetView extends React.Component {
  static propTypes = {
    street: PropTypes.object.isRequired,
    draggingType: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      isStreetScrolling: false,
      scrollIndicators: {
        left: 0,
        right: 0
      },

      resizeType: null,
      buildingWidth: 0
    }

    this.sectionEl = React.createRef()
    this.sectionCanvasEl = React.createRef()
  }

  componentDidMount () {
    this.handleStreetResize()
    window.addEventListener('resize', this.handleStreetResize)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleStreetResize)
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.street.width !== this.props.street.width) {
      // We are permitted one setState in componentDidUpdate if
      // it's inside of a condition, like it is now.
      this.handleStreetResize()
    }

    // Two cases where scrollLeft might have to be updated:
    // 1) Building width has changed due to segments being dragged in/out of StreetView or being resized
    // 2) Street width changed causing remainingWidth to change, but not building width
    if (
      prevState.buildingWidth !== this.state.buildingWidth ||
      (prevState.resizeType === STREETVIEW_RESIZED && !this.state.resizeType)
    ) {
      const deltaX = this.state.buildingWidth - prevState.buildingWidth

      // If segment was resized (either dragged or incremented), update scrollLeft to make up for margin change.
      if (
        prevState.resizeType === SEGMENT_RESIZED ||
        prevState.resizeType === this.state.resizeType
      ) {
        this.updateScrollLeft(deltaX)
      } else if (prevState.resizeType === STREETVIEW_RESIZED) {
        // If StreetView was resized/changed (either viewport, streetWidth, or street itself),
        // update scrollLeft to center street view and check if margins need to be updated.
        this.updateScrollLeft()
        this.resizeStreetExtent(SEGMENT_RESIZED, true)
      }
    }

    // Updating margins when segment is resized by dragging is handled in resizing.js
    if (
      prevProps.street.occupiedWidth !== this.props.street.occupiedWidth &&
      this.props.draggingType !== DRAGGING_TYPE_RESIZE
    ) {
      // Check if occupiedWidth changed because segment was changed (resized, added, or removed)
      // or because gallery street was changed, and update accordingly.
      const resizeType =
        this.props.street.id !== prevProps.street.id
          ? STREETVIEW_RESIZED
          : SEGMENT_RESIZED
      const dontDelay = resizeType === STREETVIEW_RESIZED
      this.resizeStreetExtent(resizeType, dontDelay)
    }
  }

  resizeStreetExtent = (resizeType, dontDelay) => {
    const marginUpdated = updateStreetMargin(
      this.sectionCanvasEl.current,
      this.sectionEl.current,
      dontDelay
    )

    if (marginUpdated) {
      this.setState({ resizeType })
    }
  }

  updateScrollLeft = (deltaX) => {
    let scrollLeft = this.sectionEl.current.scrollLeft

    if (deltaX) {
      scrollLeft += deltaX
    } else {
      const streetWidth = this.props.street.width * TILE_SIZE
      const currBuildingSpace = this.state.buildingWidth
        ? this.state.buildingWidth
        : BUILDING_SPACE
      scrollLeft = (streetWidth + currBuildingSpace * 2 - window.innerWidth) / 2
    }

    this.sectionEl.current.scrollLeft = scrollLeft
  }

  onResize = () => {
    if (!this.sectionCanvasEl.current) return

    const viewportWidth = window.innerWidth
    const streetWidth = this.props.street.width * TILE_SIZE
    let streetSectionCanvasLeft =
      (viewportWidth - streetWidth) / 2 - BUILDING_SPACE

    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0
    }

    this.sectionCanvasEl.current.style.width = streetWidth + 'px'
    this.sectionCanvasEl.current.style.left = streetSectionCanvasLeft + 'px'

    return {
      resizeType: STREETVIEW_RESIZED
    }
  }

  handleStreetResize = () => {
    // Place all scroll-based positioning effects inside of a "raf"
    // callback for better performance.
    window.requestAnimationFrame(() => {
      const resizeState = this.onResize()
      const scrollIndicators = this.calculateScrollIndicators()

      this.setState({
        ...resizeState,
        scrollIndicators
      })
    })
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
        scrollIndicators,
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
    const el = this.sectionEl.current
    if (!el) return

    let scrollIndicatorsLeft
    let scrollIndicatorsRight

    if (el.scrollWidth <= el.offsetWidth) {
      scrollIndicatorsLeft = 0
      scrollIndicatorsRight = 0
    } else {
      const left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

      // TODO const off max width street
      let posMax = Math.round(
        (this.props.street.width / MAX_CUSTOM_STREET_WIDTH) * 6
      )
      if (posMax < 2) {
        posMax = 2
      }

      scrollIndicatorsLeft = Math.round(posMax * left)
      if (left > 0 && scrollIndicatorsLeft === 0) {
        scrollIndicatorsLeft = 1
      }
      if (left < 1.0 && scrollIndicatorsLeft === posMax) {
        scrollIndicatorsLeft = posMax - 1
      }
      scrollIndicatorsRight = posMax - scrollIndicatorsLeft
    }

    return {
      left: scrollIndicatorsLeft,
      right: scrollIndicatorsRight
    }
  }

  scrollStreet = (left, far = false) => {
    const el = this.sectionEl.current
    let newScrollLeft

    if (left) {
      if (far) {
        newScrollLeft = 0
      } else {
        newScrollLeft = el.scrollLeft - el.offsetWidth * 0.5
      }
    } else {
      if (far) {
        newScrollLeft = el.scrollWidth - el.offsetWidth
      } else {
        newScrollLeft = el.scrollLeft + el.offsetWidth * 0.5
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
    return this.sectionEl.current?.scrollLeft ?? 0
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
    const perspective = -(pos[0] - scrollPos - window.innerWidth / 2)

    el.style.webkitPerspectiveOrigin = perspective / 2 + 'px 50%'
    el.style.MozPerspectiveOrigin = perspective / 2 + 'px 50%'
    el.style.perspectiveOrigin = perspective / 2 + 'px 50%'
  }

  render () {
    return (
      <>
        <section
          id="street-section-outer"
          onScroll={this.handleStreetScroll}
          ref={this.sectionEl}
        >
          <section id="street-section-inner">
            <section id="street-section-canvas" ref={this.sectionCanvasEl}>
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
            <ScrollIndicators
              left={this.state.scrollIndicators.left}
              right={this.state.scrollIndicators.right}
              scrollStreet={this.scrollStreet}
            />
          </section>
        </section>
        <SkyBox scrollPos={this.state.scrollPos} />
      </>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    draggingType: state.ui.draggingType
  }
}

export default connect(mapStateToProps)(StreetView)
