import React from 'react'
import { registerKeypress } from './keypress'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'

class ScrollIndicators extends React.Component {
	constructor (props) {
		super(props)
	}

	componentDidMount () {
		window.addEventListener('resize', this.props.updateStreetScrollIndicators)
		registerKeypress('left', (event) => { this.props.scrollStreet(true, event.shiftKey) })
		registerKeypress('right', (event) => { this.props.scrollStreet(false, event.shiftKey) })
	}

	componentDidUpdate (prevProps) {
		if (prevProps.handleScroll !== this.props.handleScroll && this.props.handleScroll === true) {
			this.props.updateStreetScrollIndicators()
		}
	}

	render () {
		return (
			<div className="street-scroll-indicators">
				<div id="street-scroll-indicator-left" onClick={(e) => this.props.scrollStreet(true, e.shiftKey)} ref={this.props.leftIndicator} />
        <div id="street-scroll-indicator-right" onClick={(e) => this.props.scrollStreet(false, e.shiftKey)} ref={this.props.rightIndicator} />
      </div>
		)
	}
}

export default ScrollIndicators