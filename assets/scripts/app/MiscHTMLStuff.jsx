/**
 * MiscHTMLStuff.jsx
 *
 * Temporary: Renders all the non-React HTML.
 *
 * @module MiscHTMLStuff
 */
import React from 'react'
import ScrollIndicators from './ScrollIndicators'
import { connect } from 'react-redux'
import { infoBubble } from '../info_bubble/info_bubble'
import { system } from '../preinit/system_capabilities'
import { animate } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'

class MiscHTMLStuff extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      streetSectionScroll: false
    }
  }

  onStreetSectionScroll = (event) => {
    infoBubble.suppress()

    var scrollPos = this.street_section_outer.scrollLeft

    var frontPos = -scrollPos * 0.5
    this.front_clouds.style[this.props.system.cssTransform] =
      'translateX(' + frontPos + 'px)'

    var rearPos = -scrollPos * 0.25
    this.rear_clouds.style[this.props.system.cssTransform] =
      'translateX(' + rearPos + 'px)'

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    this.setState({
      streetSectionScroll: true
    })

  }

  updateStreetScrollIndicators = (left, right) => {
    const el = this.street_section_outer
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
      
      this.left_indicator.innerHTML = Array(posLeft + 1).join('‹')
      this.right_indicator.innerHTML = Array(posRight + 1).join('›')
    }

    this.setState({
      streetSectionScroll: false
    })
  }

  scrollStreet = (left, far = false) => {
    const el = this.street_section_outer
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
        <section id="street-section-outer" onScroll={this.onStreetSectionScroll} ref={(ref) => { this.street_section_outer = ref }}>
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
        <section id="street-section-sky">
          <div className="rear-clouds" ref={(ref) => { this.rear_clouds = ref }} />
          <div className="front-clouds" ref={(ref) => { this.front_clouds = ref }} />
        </section>
        <ScrollIndicators 
          handleScroll={this.state.streetSectionScroll} 
          updateStreetScrollIndicators={this.updateStreetScrollIndicators} 
          scrollStreet={this.scrollStreet}
          leftIndicator={(ref) => { this.left_indicator = ref }}
          rightIndicator={(ref) => {this.right_indicator = ref }}
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
