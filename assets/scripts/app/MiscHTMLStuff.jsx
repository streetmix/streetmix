/**
 * MiscHTMLStuff.jsx
 *
 * Temporary: Renders all the non-React HTML.
 *
 * @module MiscHTMLStuff
 */
import React from 'react'
import { connect } from 'react-redux'
import SkyBackground from './SkyBackground'
import ScrollIndicators from './ScrollIndicators'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'
import { app } from '../preinit/app_settings'

class MiscHTMLStuff extends React.Component {
  constructor (props) {
    super(props) 

    this.state = {
      isStreetScrolling: false,
      scrollPos: 0,
      posLeft: 0,
      posRight: 0,

      streetSectionTop: 0,
      streetSectionHeight: 0,
      streetSectionSkyTop: 0,
      scrollTop: 0,
      skyTop: 0
    }
  }

  componentDidUpdate (prevProps) {
    const { viewportWidth, viewportHeight } = this.props.system
    if (prevProps.system.viewportWidth !== viewportWidth || 
        prevProps.system.viewportHeight !== viewportHeight) {
      this.onResize()
      this.calculateStreetIndicatorsPositions()
    }
  }

  onResize = () => {
    const { viewportHeight, viewportWidth } = this.props.system
    let streetSectionTop = null
    let streetSectionHeight = this.refs.street_section_inner.offsetHeight

    if (viewportHeight - streetSectionHeight > 450) {
      streetSectionTop = ((viewportHeight - streetSectionHeight - 450) / 2) + 450 + 80
    } else {
      streetSectionTop = viewportHeight - streetSectionHeight + 70
    }

    if (app.readOnly) {
      streetSectionTop += 80
    }

    //street-section-sky
    let streetSectionSkyTop = ((streetSectionTop * 0.8) - 255)
    //street-scroll-indicators
    let scrollTop = (streetSectionTop + streetSectionHeight) 

    // not adding streetSectionDirtPos

    //street-section-sky
    let skyTop = streetSectionTop
    if (skyTop < 0) {
      skyTop = 0
    }

    this.refs.street_section_inner.style.top = streetSectionTop + 'px'
    // not adding streetSectionCanvasLeft
    // not adding editableWidth

    this.setState({
      streetSectionTop,
      streetSectionHeight,
      streetSectionSkyTop,
      scrollTop,
      skyTop
    })
  }

  handleStreetScroll = (event) => {
    infoBubble.suppress()

    var scrollPos = this.refs.street_section_outer.scrollLeft
    
    this.calculateStreetIndicatorsPositions()

    this.setState({
      isStreetScrolling: true,
      scrollPos: scrollPos
    })
  }

  stopStreetScroll = () => {
    this.setState({
      isStreetScrolling: false
    })
  }

  calculateStreetIndicatorsPositions = () => {
    const el = this.refs.street_section_outer
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
    const el = this.refs.street_section_outer
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

  render () {
    return (
      <React.Fragment>
        <section id="street-section-outer" ref="street_section_outer" onScroll={this.handleStreetScroll}>
          <section id="street-section-inner" ref="street_section_inner">
            <section id="street-section-canvas">
              <section id="street-section-left-building" className="street-section-building">
                <div className="hover-bk" />
              </section>
              <section id="street-section-right-building" className="street-section-building">
                <div className="hover-bk" />
              </section>
              <div id="street-section-editable" />
              <div id="street-section-left-empty-space" className="segment empty" />
              <div id="street-section-right-empty-space" className="segment empty" />
              <section id="street-section-dirt" />
            </section>
          </section>
        </section>
        <SkyBackground 
          isStreetScrolling={this.state.isStreetScrolling} 
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

export default connect(mapStateToProps)(MiscHTMLStuff)
