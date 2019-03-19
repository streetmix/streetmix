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
import { IntlProvider } from 'react-intl'
import StreetEditableContainer from './StreetEditableContainer'
import StreetViewDirt from './StreetViewDirt'
import SkyBackground from './SkyBackground'
import ScrollIndicators from './ScrollIndicators'
import Building from '../segments/Building'
import ResizeGuides from '../segments/ResizeGuides'
import EmptySegmentContainer from '../segments/EmptySegmentContainer'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'
import { BUILDING_SPACE } from '../segments/buildings'
import { TILE_SIZE } from '../segments/constants'
import { DRAGGING_TYPE_RESIZE } from '../segments/drag_and_drop'
import { updateStreetMargin } from '../segments/resizing'
import './StreetView.scss'

const SEGMENT_RESIZED = 1
const STREETVIEW_RESIZED = 2

class StreetView extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.object.isRequired,
    system: PropTypes.object.isRequired,
    locale: PropTypes.object.isRequired,
    draggingType: PropTypes.number
  }

  static defaultProps = {
    readOnly: false
  }

  constructor (props) {
    super(props)

    this.state = {
      isStreetScrolling: false,
      scrollPos: 0,
      posLeft: 0,
      posRight: 0,

      scrollTop: 0,
      skyHeight: 0,

      resizeType: null,
      buildingWidth: 0
    }
  }

  componentDidMount () {
    const resizeState = this.onResize()
    const streetIndicators = this.calculateStreetIndicatorsPositions()

    this.setState({
      ...resizeState,
      ...streetIndicators
    })
  }

  componentDidUpdate (prevProps, prevState) {
    const { viewportWidth, viewportHeight } = this.props.system

    if (prevProps.system.viewportWidth !== viewportWidth ||
        prevProps.system.viewportHeight !== viewportHeight ||
        prevProps.street.width !== this.props.street.width) {
      const resizeState = this.onResize()
      const streetIndicators = this.calculateStreetIndicatorsPositions()

      // We are permitted one setState in componentDidUpdate if
      // it's inside of a condition, like it is now.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        ...resizeState,
        ...streetIndicators
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
    const marginUpdated = updateStreetMargin(this.streetSectionCanvas, this.streetSectionOuter, dontDelay)

    if (marginUpdated) {
      this.setState({ resizeType: resizeType })
    }
  }

  updateScrollLeft = (deltaX) => {
    let scrollLeft = this.streetSectionOuter.scrollLeft

    if (deltaX) {
      scrollLeft += deltaX
    } else {
      const streetWidth = this.props.street.width * TILE_SIZE
      const currBuildingSpace = (this.state.buildingWidth) ? (this.state.buildingWidth) : BUILDING_SPACE
      scrollLeft = (streetWidth + (currBuildingSpace * 2) - this.props.system.viewportWidth) / 2
    }

    this.streetSectionOuter.scrollLeft = scrollLeft
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

  handleStreetScroll = (event) => {
    infoBubble.suppress()

    const scrollPos = this.streetSectionOuter.scrollLeft
    const streetIndicators = this.calculateStreetIndicatorsPositions()

    this.setState({
      scrollPos: scrollPos,
      ...streetIndicators
    })
  }

  calculateStreetIndicatorsPositions = () => {
    const el = this.streetSectionOuter
    let posLeft
    let posRight

    if (el.scrollWidth <= el.offsetWidth) {
      posLeft = 0
      posRight = 0
    } else {
      var left = el.scrollLeft / (el.scrollWidth - el.offsetWidth)

      // TODO const off max width street
      var posMax = Math.round(this.props.street.width / MAX_CUSTOM_STREET_WIDTH * 6)
      if (posMax < 2) {
        posMax = 2
      }

      posLeft = Math.round(posMax * left)
      if ((left > 0) && (posLeft === 0)) {
        posLeft = 1
      }
      if ((left < 1.0) && (posLeft === posMax)) {
        posLeft = posMax - 1
      }
      posRight = posMax - posLeft
    }

    return {
      posLeft: posLeft,
      posRight: posRight
    }
  }

  scrollStreet = (left, far = false) => {
    const el = this.streetSectionOuter
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

  updatePerspective = (el) => {
    if (!el) return

    const pos = getElAbsolutePos(el)
    const scrollPos = (this.streetSectionOuter && this.streetSectionOuter.scrollLeft) || this.state.scrollPos
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
          ref={(ref) => { this.streetSectionOuter = ref }}
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
              <StreetEditableContainer
                resizeType={this.state.resizeType}
                setBuildingWidth={this.setBuildingWidth}
                updatePerspective={this.updatePerspective}
                draggingType={this.props.draggingType}
              />
              <IntlProvider
                locale={this.props.locale.locale}
                key={this.props.locale.locale}
                messages={this.props.locale.messages}
              >
                <React.Fragment>
                  <ResizeGuides />
                  <EmptySegmentContainer />
                </React.Fragment>
              </IntlProvider>
              <StreetViewDirt buildingWidth={this.state.buildingWidth} />
            </section>
          </section>
        </section>
        <SkyBackground
          scrollPos={this.state.scrollPos}
          height={this.state.skyHeight}
        />
        <ScrollIndicators
          posLeft={this.state.posLeft}
          posRight={this.state.posRight}
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
    locale: state.locale,
    draggingType: state.ui.draggingType
  }
}

export default connect(mapStateToProps)(StreetView)
