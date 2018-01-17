/**
 * MiscHTMLStuff.jsx
 *
 * Temporary: Renders all the non-React HTML.
 *
 * @module MiscHTMLStuff
 */
import React from 'react'
import SkyBackground from './SkyBackground'
import { infoBubble } from '../info_bubble/info_bubble'

class MiscHTMLStuff extends React.Component {
  constructor (props) {
    super(props) 

    this.state = {
      isStreetScrolling: false,
      scrollPos: 0
    }
  }

  handleStreetScroll = (event) => {
    infoBubble.suppress()

    var scrollPos = this.refs.street_section_outer.scrollLeft
    
    this.setState({
      isStreetScrolling: true,
      scrollPos: scrollPos
    })

    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  stopStreetScroll = () => {
    this.setState({
      isStreetScrolling: false
    })
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
        <div id="street-scroll-indicator-left" />
        <div id="street-scroll-indicator-right" />
      </React.Fragment>
    )
  }
}

export default MiscHTMLStuff
