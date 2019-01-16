import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getEnvirons } from '../streets/environs'
import './SkyBackground.scss'

class SkyBackground extends React.PureComponent {
  static propTypes = {
    scrollPos: PropTypes.number.isRequired,
    streetSectionSkyTop: PropTypes.number.isRequired,
    skyTop: PropTypes.number.isRequired,
    system: PropTypes.object.isRequired,
    environment: PropTypes.string.isRequired
  }

  updateStreetSkyBackground = (isFront, scrollPos) => {
    let style = ''
    if (isFront) {
      const frontPos = -scrollPos * 0.5
      style = 'translateX(' + frontPos + 'px)'
    } else {
      const rearPos = -scrollPos * 0.25
      style = 'translateX(' + rearPos + 'px)'
    }
    return style
  }

  render () {
    const { streetSectionSkyTop, skyTop, scrollPos, system, environment } = this.props

    const environs = getEnvirons(environment)

    const skyStyle = {
      top: streetSectionSkyTop + 'px',
      paddingTop: skyTop + 'px',
      marginTop: -skyTop + 'px'
    }

    const frontCloudStyle = {
      [system.cssTransform]: this.updateStreetSkyBackground(true, scrollPos),
      opacity: environs.cloudOpacity || null
    }
    const rearCloudStyle = {
      [system.cssTransform]: this.updateStreetSkyBackground(false, scrollPos),
      opacity: environs.cloudOpacity || null
    }

    return (
      <section className="street-section-sky" style={skyStyle}>
        <div className="sky-background">
          <div className="sky-background-default" />
        </div>
        <div className="rear-clouds" style={rearCloudStyle} />
        <div className="front-clouds" style={frontCloudStyle} />
      </section>
    )
  }
}

function mapStateToProps (state) {
  return {
    system: state.system,
    environment: state.street.environment
  }
}

export default connect(mapStateToProps)(SkyBackground)
