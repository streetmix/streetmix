import React from 'react'
import { registerKeypress } from './keypress'

class ScrollIndicators extends React.Component {
	constructor (props) {
		super(props)
	}

	shouldComponentUpdate (nextProps) {
		if (this.props.posLeft !== nextProps.posLeft &&
				this.props.posRight !== nextProps.posRight) {
			this.refs.left_indicator.innerHTML = Array(nextProps.posLeft + 1).join('‹')
  		this.refs.right_indicator.innerHTML = Array(nextProps.posRight + 1).join('›')
  		return true
		}
		return false
	}

	componentDidMount () {
		registerKeypress('left', (event) => { this.props.scrollStreet(true, event.shiftKey) })
		registerKeypress('right', (event) => { this.props.scrollStreet(false, event.shiftKey) })
	}

	render () {
		return (
			<div className="street-scroll-indicators">
				<div id="street-scroll-indicator-left" onClick={(e) => this.props.scrollStreet(true, e.shiftKey)} ref="left_indicator" />
        <div id="street-scroll-indicator-right" onClick={(e) => this.props.scrollStreet(false, e.shiftKey)} ref="right_indicator" />
      </div>
		)
	}
}

export default ScrollIndicators