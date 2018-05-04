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
import SkyBackground from './SkyBackground'
import ScrollIndicators from './ScrollIndicators'
import Building from '../segments/Building'
import EmptySegment from '../segments/EmptySegment'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate, getElAbsolutePos } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'
import { BUILDING_SPACE } from '../segments/buildings'
import { TILE_SIZE } from '../segments/view'
import { app } from '../preinit/app_settings'

class StreetView extends React.Component {
  static propTypes = {
    street: PropTypes.object.isRequired,
    system: PropTypes.object.isRequired
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

      buildingWidth: 0
    }
  }

  componentDidMount () {
    this.getBuildingWidth()
  }

  componentDidUpdate (prevProps) {
    const { viewportWidth, viewportHeight } = this.props.system
    if (prevProps.system.viewportWidth !== viewportWidth ||
        prevProps.system.viewportHeight !== viewportHeight ||
        prevProps.street.width !== this.props.street.width) {
      this.onResize()
      this.getBuildingWidth()
      this.calculateStreetIndicatorsPositions()
    }
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

    if (app.readOnly) {
      streetSectionTop += 80
    }

    let streetSectionSkyTop = ((streetSectionTop * 0.8) - 255)
    let scrollTop = (streetSectionTop + streetSectionHeight)

    let skyTop = streetSectionTop
    if (skyTop < 0) {
      skyTop = 0
    }

    let streetSectionCanvasLeft =
      ((viewportWidth - (this.props.street.width * TILE_SIZE)) / 2) - BUILDING_SPACE
    if (streetSectionCanvasLeft < 0) {
      streetSectionCanvasLeft = 0
    }

    this.streetSectionCanvas.style.left = streetSectionCanvasLeft + 'px'
    this.streetSectionEditable.style.width = (this.props.street.width * TILE_SIZE) + 'px'
    this.streetSectionInner.style.top = streetSectionTop + 'px'

    this.setState({
      streetSectionSkyTop,
      scrollTop,
      skyTop
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

  getBuildingWidth = () => {
    const el = this.streetSectionEditable
    const pos = getElAbsolutePos(el)

    let width = pos[0] + 25
    if (width < 0) {
      width = 0
    }

    this.setState({
      buildingWidth: width
    })
  }

  calculateBuildingPerspective = (el) => {
    const pos = getElAbsolutePos(el)
    const perspective = -(pos[0] - this.streetSectionOuter.scrollLeft - (this.props.system.viewportWidth / 2))

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
                calculateBuildingPerspective={this.calculateBuildingPerspective}
              />
              <Building
                position="right"
                buildingWidth={this.state.buildingWidth}
                calculateBuildingPerspective={this.calculateBuildingPerspective}
              />
              <div id="street-section-editable" ref={(ref) => { this.streetSectionEditable = ref }} />
              <EmptySegment position="left" />
              <EmptySegment position="right" />
              <section id="street-section-dirt" style={dirtStyle} />
            </section>
          </section>
        </section>
        <SkyBackground
          scrollPos={this.state.scrollPos}
          stopStreetScroll={this.stopStreetScroll}
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
    street: state.street,
    system: state.system
  }
}

export default connect(mapStateToProps)(StreetView)
