/**
 * MiscHTMLStuff.jsx
 *
 * Temporary: Renders all the non-React HTML.
 *
 * @module MiscHTMLStuff
 */
import React from 'react'
import ScrollIndicators from './ScrollIndicators'
import { infoBubble } from '../info_bubble/info_bubble'

class MiscHTMLStuff extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      street_section_outer: null
    }
  }

  componentDidMount () {
    this.setState({
      street_section_outer: this.street_section_outer
    })
    console.log(this.street_section_outer)
  }

  render () {
    return (
      <React.Fragment>
        <section id="street-section-outer" ref={(ref) => { this.street_section_outer = ref }}>
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
        <ScrollIndicators outerSection={this.state.street_section_outer} onStreetSectionScroll={this.onStreetSectionScroll} />
      </React.Fragment>
    )
  }
}

export default MiscHTMLStuff
