import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import SkyBackground from './SkyBackground'
import SkyObjects from './SkyObjects'
import { getEnvirons, makeCSSGradientDeclaration } from '../streets/environs'
import { DEFAULT_ENVIRONS } from '../streets/constants'
import './SkyContainer.scss'

const REAR_CLOUD_PARALLAX_SPEED = 0.25
const FRONT_CLOUD_PARALLAX_SPEED = 0.5

SkyContainer.propTypes = {
  scrollPos: PropTypes.number,
  height: PropTypes.number.isRequired
}

function SkyContainer (props) {
  const { scrollPos = 0, height } = props
  const environment = useSelector(
    (state) => state.street.environment || DEFAULT_ENVIRONS
  )

  const skyStyle = {
    height: `${height}px`
  }

  const environs = getEnvirons(environment)
  const frontCloudStyle = {
    ...getCloudPosition(true, scrollPos),
    opacity: environs.cloudOpacity || null
  }
  const rearCloudStyle = {
    ...getCloudPosition(false, scrollPos),
    opacity: environs.cloudOpacity || null
  }

  const foregroundStyle = {}
  if (environs.foregroundGradient) {
    foregroundStyle.backgroundImage = makeCSSGradientDeclaration(
      environs.foregroundGradient
    )
    foregroundStyle.opacity = 1
  } else {
    foregroundStyle.opacity = 0
  }

  return (
    <section className="street-section-sky" style={skyStyle}>
      <SkyBackground environment={environment} />
      <SkyObjects objects={environs.backgroundObjects} />
      <div className="rear-clouds" style={rearCloudStyle} />
      <div className="front-clouds" style={frontCloudStyle} />
      <div className="sky-foreground" style={foregroundStyle} />
    </section>
  )
}

function getCloudPosition (isFront, scrollPos) {
  const speed = isFront ? FRONT_CLOUD_PARALLAX_SPEED : REAR_CLOUD_PARALLAX_SPEED
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`
  }
}

export default SkyContainer
