import React from 'react'
import { connect } from 'react-redux'
import { registerKeypress } from './keypress'
import { infoBubble } from '../info_bubble/info_bubble'
import { animate } from '../util/helpers'
import { MAX_CUSTOM_STREET_WIDTH } from '../streets/width'

class ScrollIndicators extends React.Component {
	constructor(props) {
		super(props)
	}

	componentDidMount () {
		window.addEventListener('resize', this.updateStreetScrollIndicators)
		registerKeypress('left', (event) => { this.scrollStreet(true, event.shiftKey) })
		registerKeypress('right', (event) => { this.scrollStreet(false, event.shiftKey) })
	}

	componentDidUpdate (prevProps) {
		if (this.props.outerSection !== null && prevProps.outerSection !== this.props.outerSection) {
			console.log(this.props.outerSection)
			this.props.outerSection.addEventListener('scroll', this.updateStreetScrollIndicators)
		}
	}

	scrollStreet = (left, far = false) => {
		const el = this.props.outerSection
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

	updateStreetScrollIndicators = () => {
		const el = this.props.outerSection
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
	}

	render () {
		return (
			<div className="street-scroll-indicators">
				<div id="street-scroll-indicator-left" onClick={(e) => this.scrollStreet(true, e.shiftKey)} ref={(ref) => { this.left_indicator = ref }} />
        <div id="street-scroll-indicator-right" onClick={(e) => this.scrollStreet(false, e.shiftKey)} ref={(ref) => { this.right_indicator = ref }} />
      </div>
		)
	}
}

function mapStateToProps (state) {
	return {
		street: state.street
	}
}
export default connect(mapStateToProps)(ScrollIndicators)