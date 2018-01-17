import React from 'react'
import { connect } from 'react-redux'

class SkyBackground extends React.Component {
	constructor (props) {
		super(props)
	}

	shouldComponentUpdate (nextProps) {
		if (this.props.isStreetScrolling !== nextProps.isStreetScrolling && nextProps.isStreetScrolling === true) {
			this.updateStreetSkyBackground(nextProps.scrollPos)
			return true
		}
		return false
	}

	updateStreetSkyBackground = () => {
		const { scrollPos, system } = this.props
		var frontPos = -scrollPos * 0.5
	  this.refs.front_clouds.style[system.cssTransform] =
	    'translateX(' + frontPos + 'px)'

	  var rearPos = -scrollPos * 0.25
	  this.refs.rear_clouds.style[system.cssTransform] =
	    'translateX(' + rearPos + 'px)'

	  this.props.stopStreetScroll()
	}

	render() {
		return (
			<section id="street-section-sky">
        <div className="rear-clouds" ref="rear_clouds" />
        <div className="front-clouds" ref="front_clouds" />
      </section>
		)
	}
}

function mapStateToProps (state) {
	return {
		system: state.system
	}
}

export default connect(mapStateToProps)(SkyBackground)