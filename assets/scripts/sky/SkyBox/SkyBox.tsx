import React from 'react'
import { useSelector } from '../../store/hooks'
import { getEnvirons, makeCSSGradientDeclaration } from '../environs'
import { DEFAULT_SKY } from '../constants'
import SkyBackground from './SkyBackground'
import SkyObjects from './SkyObjects'
import './SkyBox.scss'

const REAR_CLOUD_PARALLAX_SPEED = 0.25
const FRONT_CLOUD_PARALLAX_SPEED = 0.5

interface SkyContainerProps {
  scrollPos?: number
}

function SkyContainer (props: SkyContainerProps): React.ReactElement {
  const { scrollPos = 0 } = props
  const environment: string = useSelector(
    (state) => state.street.environment || DEFAULT_SKY
  )
  const animations = useSelector(
    (state) => state.flags.SKY_ANIMATED_CLOUDS?.value || false
  )

  const environs = getEnvirons(environment)
  const frontCloudStyle: React.CSSProperties = {
    ...getCloudPosition(true, scrollPos),
    opacity: environs.cloudOpacity
  }
  const rearCloudStyle: React.CSSProperties = {
    ...getCloudPosition(false, scrollPos),
    opacity: environs.cloudOpacity
  }

  const foregroundStyle: React.CSSProperties = {}
  if (environs.foregroundGradient !== undefined) {
    foregroundStyle.backgroundImage = makeCSSGradientDeclaration(
      environs.foregroundGradient
    )
    foregroundStyle.opacity = 1
  } else {
    foregroundStyle.opacity = 0
  }

  const classes = ['street-section-sky']
  if (animations) {
    classes.push('sky-animations')
  }

  return (
    <section className={classes.join(' ')}>
      <SkyBackground environment={environment} />
      <SkyObjects objects={environs.backgroundObjects} />
      <div className="rear-clouds" style={rearCloudStyle} />
      <div className="front-clouds" style={frontCloudStyle} />
      <div className="sky-foreground" style={foregroundStyle} />
    </section>
  )
}

function getCloudPosition (
  isFront: boolean,
  scrollPos: number
): React.CSSProperties {
  const speed = isFront
    ? FRONT_CLOUD_PARALLAX_SPEED
    : REAR_CLOUD_PARALLAX_SPEED
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`
  }
}

export default SkyContainer
