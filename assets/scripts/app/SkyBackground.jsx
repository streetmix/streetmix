import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class SkyBackground extends React.Component {
  static propTypes = {
    isStreetScrolling: PropTypes.bool.isRequired,
    scrollPos: PropTypes.number.isRequired,
    stopStreetScroll: PropTypes.func.isRequired,
    streetSectionSkyTop: PropTypes.number.isRequired,
    skyTop: PropTypes.number.isRequired,
    system: PropTypes.object.isRequired
  }

  shouldComponentUpdate (nextProps) {
    if (this.props.isStreetScrolling !== nextProps.isStreetScrolling && nextProps.isStreetScrolling === true) {
      this.updateStreetSkyBackground(nextProps.scrollPos)
      return true
    }
    // Checking if window was resized
    if (this.props.streetSectionSkyTop !== nextProps.streetSectionSkyTop &&
        this.props.skyTop !== nextProps.skyTop) {
      this.updateSkyPosition(nextProps.streetSectionSkyTop, nextProps.skyTop)
      return true
    }
    return false
  }

  updateSkyPosition = (streetSectionSkyTop, skyTop) => {
    if (streetSectionSkyTop !== 0 && skyTop !== 0) {
      this.refs.street_section_sky.style.top = streetSectionSkyTop + 'px'
      this.refs.street_section_sky.style.paddingTop = skyTop + 'px'
      this.refs.street_section_sky.style.marginTop = -skyTop + 'px'
    }
  }

  updateStreetSkyBackground = (scrollPos) => {
    const { system } = this.props
    if (scrollPos !== 0) {
      const frontPos = -scrollPos * 0.5
      this.refs.front_clouds.style[system.cssTransform] =
        'translateX(' + frontPos + 'px)'

      const rearPos = -scrollPos * 0.25
      this.refs.rear_clouds.style[system.cssTransform] =
        'translateX(' + rearPos + 'px)'
    }

    this.props.stopStreetScroll()
  }

  render () {
    return (
      <section id="street-section-sky" ref="street_section_sky">
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
