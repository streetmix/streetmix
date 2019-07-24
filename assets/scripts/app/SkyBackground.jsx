import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SkyBackgroundObjects from './SkyBackgroundObjects'
import { getEnvirons, makeCSSGradientDeclaration } from '../streets/environs'
import { DEFAULT_ENVIRONS } from '../streets/constants'
import './SkyBackground.scss'

const REAR_CLOUD_PARALLAX_SPEED = 0.25
const FRONT_CLOUD_PARALLAX_SPEED = 0.5

export class SkyBackground extends React.PureComponent {
  static propTypes = {
    scrollPos: PropTypes.number,
    height: PropTypes.number.isRequired,
    environment: PropTypes.string.isRequired
  }

  static defaultProps = {
    scrollPos: 0
  }

  constructor (props) {
    super(props)

    this.state = {
      prevEnvirons: props.environment || DEFAULT_ENVIRONS
    }

    this.currentBackgroundEl = React.createRef()
  }

  componentDidUpdate (prevProps) {
    // If environs have changed, store the previous environs so we can transition
    if (this.props.environment !== prevProps.environment) {
      // Permit an immediate setState() wrapped inside a condition, as per
      // React docs (https://reactjs.org/docs/react-component.html#componentdidupdate)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        prevEnvirons: prevProps.environment
      })
    }

    // Delay applying transition class until the end of the stack, so
    // that the transition is visible
    window.setTimeout(() => {
      this.currentBackgroundEl.current.classList.add('sky-transition-in')
    }, 0)
  }

  getCloudPosition = (isFront, scrollPos) => {
    const speed = isFront ? FRONT_CLOUD_PARALLAX_SPEED : REAR_CLOUD_PARALLAX_SPEED
    const pos = scrollPos * speed

    return {
      backgroundPosition: `-${pos}px 0`
    }
  }

  render () {
    const { height, scrollPos, environment } = this.props
    const environs = getEnvirons(environment)
    const prevEnvirons = getEnvirons(this.state.prevEnvirons)

    const skyStyle = {
      height: `${height}px`
    }
    const frontCloudStyle = {
      ...this.getCloudPosition(true, scrollPos),
      opacity: environs.cloudOpacity || null
    }
    const rearCloudStyle = {
      ...this.getCloudPosition(false, scrollPos),
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
        <div className="sky-background">
          <div
            style={prevEnvirons.style}
            className="sky-background-previous"
            key={`prev-${this.state.prevEnvirons}`}
          />
          <div
            style={environs.style}
            className="sky-background-current"
            key={`current-${environment}`}
            ref={this.currentBackgroundEl}
          />
        </div>
        <SkyBackgroundObjects objects={environs.backgroundObjects} />
        <div className="rear-clouds" style={rearCloudStyle} />
        <div className="front-clouds" style={frontCloudStyle} />
        <div className="sky-foreground" style={foregroundStyle} />
      </section>
    )
  }
}

function mapStateToProps (state) {
  return {
    environment: state.street.environment
  }
}

export default connect(mapStateToProps)(SkyBackground)
