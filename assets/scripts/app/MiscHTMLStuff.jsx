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

class MiscHTMLStuff extends React.Component {
  constructor (props) {
    super(props) 

    this.state = {
      isStreetScrolling: false,
      scrollPos: 0,
      posLeft: 0,
      postRight: 0
    }
  }

  componentDidMount () {
    window.addEventListener('resize', this.calculateStreetIndicatorsPositions)
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
          <section id="street-section-inner">
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
        />
        <ScrollIndicators 
          posLeft={this.state.posLeft}
          posRight={this.state.posRight}
          scrollStreet={this.scrollStreet}
        />
      </React.Fragment>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

export default connect(mapStateToProps)(MiscHTMLStuff)
