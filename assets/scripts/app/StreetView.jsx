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
import StreetEditable from './StreetEditable'
import SkyBackground from './SkyBackground'
import ScrollIndicators from './ScrollIndicators'
import Building from '../segments/Building'
import SegmentDragGuides from '../segments/SegmentDragGuides'
import EmptySegmentContainer from '../segments/EmptySegmentContainer'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'
import { BUILDING_SPACE } from '../segments/buildings'
import { TILE_SIZE } from '../segments/constants'

class StreetView extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    street: PropTypes.object.isRequired,
    system: PropTypes.object.isRequired,
    locale: PropTypes.object.isRequired
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

      streetSectionSkyTop: 0,
      scrollTop: 0,
      skyTop: 0,

      onResized: false,
      buildingWidth: 0
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { viewportWidth, viewportHeight } = this.props.system

    if (prevProps.system.viewportWidth !== viewportWidth ||
        prevProps.system.viewportHeight !== viewportHeight ||
        prevProps.street.width !== this.props.street.width) {
      this.onResize()
      this.updateStreetMargins(true)
      // this.updateScrollLeft(streetMargin)
    }

    if (prevProps.street.remainingWidth !== this.props.street.remainingWidth) {
      this.updateStreetMargins(false)
      // const deltaX = (streetMargin + 25) - this.state.buildingWidth
      // this.streetSectionOuter.scrollLeft += deltaX
    }
  }

  // Cut off street extents occur when (-remainingWidth * TILE_SIZE / 2), otherwise known as streetMargin,
  // is greater in value than marginLeft and marginRight of streetSectionCanvas.
  // In order to fix this problem, we have to:
  // 1) Update streetSectionCanvas' marginLeft and marginRight to equal new streetMargin
  // 2) Update buildingWidth so that dirt position is extended along with it

  // Errors that occur due to the above changes are:
  // 1) Scroll position streetSectionOuter needs to be updated to keep original segments in view
  // 2) After a viewport resize, streetSectionOuter scroll position should always be centered again

  updateStreetMargins = (viewportResized) => {
    if (!this.props.street.remainingWidth || !this.props.street.occupiedWidth) {
      return BUILDING_SPACE
    }

    const { viewportWidth } = this.props.system
    const occupiedWidth = (this.props.street.occupiedWidth * TILE_SIZE)
    const defaultStreetExtent = (this.props.street.width * TILE_SIZE) + (2 * this.state.buildingWidth)

    const isOverflowing = (occupiedWidth > viewportWidth && occupiedWidth > defaultStreetExtent)
    const streetMargin = (isOverflowing) ? (-this.props.street.remainingWidth * TILE_SIZE / 2) : BUILDING_SPACE
    console.log(isOverflowing)
    const deltaX = (streetMargin + 25) - this.state.buildingWidth

    if (deltaX < 0 && (!this.state.posLeft || !this.state.posRight)) {
      console.log('here')
      return
    }

    this.streetSectionCanvas.style.marginLeft = (streetMargin) + 'px'
    this.streetSectionCanvas.style.marginRight = (streetMargin) + 'px'

    this.setState({
      onResized: true
    })

    if (viewportResized) {
      this.updateScrollLeft(streetMargin)
    } else {
      this.streetSectionOuter.scrollLeft += deltaX
      // console.log(this.streetSectionOuter.scrollLeft)
    }
  }

  updateScrollLeft = (streetMargin) => {
    const { viewportWidth } = this.props.system
    const streetWidth = (this.props.street.width * TILE_SIZE)
    const scrollLeft = (streetWidth + (streetMargin * 2) - viewportWidth) / 2
    this.streetSectionOuter.scrollLeft = Math.round(scrollLeft)
    this.calculateStreetIndicatorsPositions()
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

    let streetSectionSkyTop = ((streetSectionTop * 0.8) - 255)
    let scrollTop = (streetSectionTop + streetSectionHeight)

    let skyTop = streetSectionTop
    if (skyTop < 0) {
      skyTop = 0
    }

    const streetWidth = (this.props.street.width * TILE_SIZE)
    let streetSectionCanvasLeft =
      ((viewportWidth - streetWidth) / 2) - BUILDING_SPACE
    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0
    }

    this.streetSectionCanvas.style.width = streetWidth + 'px'
    this.streetSectionCanvas.style.left = streetSectionCanvasLeft + 'px'
    this.streetSectionInner.style.top = streetSectionTop + 'px'

    this.setState({
      streetSectionSkyTop,
      scrollTop,
      skyTop,
      onResized: true
    })
  }

  handleStreetScroll = (event) => {
    infoBubble.suppress()

    var scrollPos = this.streetSectionOuter.scrollLeft
    this.calculateStreetIndicatorsPositions()

    this.setState({
      scrollPos: scrollPos
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

    this.setState({
      posLeft: posLeft,
      posRight: posRight
      // onResized: true
    })
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

    let width = pos[0] + 25
    if (width < 0) {
      width = 0
    }

    this.setState({
      buildingWidth: width,
      onResized: false
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
    const dirtStyle = {
      marginLeft: (-this.state.buildingWidth) + 'px',
      marginRight: (-this.state.buildingWidth) + 'px'
    }

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
              <StreetEditable
                onResized={this.state.onResized}
                setBuildingWidth={this.setBuildingWidth}
                updatePerspective={this.updatePerspective}
              />
              <IntlProvider
                locale={this.props.locale.locale}
                key={this.props.locale.locale}
                messages={this.props.locale.messages}
              >
                <React.Fragment>
                  <SegmentDragGuides />
                  <EmptySegmentContainer />
                </React.Fragment>
              </IntlProvider>
              <section id="street-section-dirt" style={dirtStyle} />
            </section>
          </section>
        </section>
        <SkyBackground
          scrollPos={this.state.scrollPos}
          streetSectionSkyTop={this.state.streetSectionSkyTop}
          skyTop={this.state.skyTop}
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
    locale: state.locale
  }
}

export default connect(mapStateToProps)(StreetView)
