import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getEnvirons, makeCSSGradientDeclaration } from '../streets/environs'
import './SkyBackground.scss'

class SkyBackground extends React.PureComponent {
  static propTypes = {
    scrollPos: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    system: PropTypes.object.isRequired,
    environment: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)

    this.backgroundEl = React.createRef()
  }

  componentDidUpdate () {
    // Use good old-fashioned DOM manipulation to transition backgrounds.
    // Is there a React way of doing this?
    const skyEl = this.backgroundEl.current
    const env = getEnvirons(this.props.environment)

    const oldBg = skyEl.querySelector('div')
    const newBg = document.createElement('div')

    if (env.style.backgroundColor) {
      newBg.style.backgroundColor = env.style.backgroundColor
    }
    if (env.style.backgroundImage) {
      newBg.style.backgroundImage = env.style.backgroundImage
    }
    if (env.style.background) {
      newBg.style.background = env.style.background
    }

    skyEl.insertBefore(newBg, oldBg)
    oldBg.classList.add('sky-transition-out')
    window.setTimeout(() => {
      if (oldBg) {
        oldBg.remove()
      }
    }, 500)
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
    const { height, scrollPos, system, environment } = this.props
    const environs = getEnvirons(environment)

    const skyStyle = {
      height: `${height}px`
    }
    const frontCloudStyle = {
      [system.cssTransform]: this.updateStreetSkyBackground(true, scrollPos),
      opacity: environs.cloudOpacity || null
    }
    const rearCloudStyle = {
      [system.cssTransform]: this.updateStreetSkyBackground(false, scrollPos),
      opacity: environs.cloudOpacity || null
    }

    let foregroundStyle = {}
    if (environs.foregroundGradient) {
      foregroundStyle.backgroundImage = makeCSSGradientDeclaration(environs.foregroundGradient)
      foregroundStyle.opacity = 1
    } else {
      foregroundStyle.opacity = 0
    }

    return (
      <section className="street-section-sky" style={skyStyle}>
        <div className="sky-background" ref={this.backgroundEl}>
          <div className="sky-background-default" />
        </div>
        <div className="sky-background-objects">
          {/* <div className="sky-superbloodwolfmoon" /> */}
        </div>
        <div className="rear-clouds" style={rearCloudStyle} />
        <div className="front-clouds" style={frontCloudStyle} />
        <div className="sky-foreground" style={foregroundStyle} />
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
