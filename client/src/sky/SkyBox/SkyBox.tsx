import React from 'react'

import { useSelector } from '../../store/hooks'
import { getSkyboxDef, makeCSSGradientDeclaration } from '..'
import { DEFAULT_SKYBOX } from '../constants'
import SkyBackground from './SkyBackground'
import SkyObjects from './SkyObjects'
import './SkyBox.css'

const REAR_CLOUD_PARALLAX_SPEED = 0.25
const FRONT_CLOUD_PARALLAX_SPEED = 0.5

interface SkyContainerProps {
  scrollPos?: number
}

function SkyContainer (props: SkyContainerProps): React.ReactElement {
  const { scrollPos = 0 } = props
  const skybox: string = useSelector(
    (state) => state.street.skybox || DEFAULT_SKYBOX
  )
  const animations = useSelector(
    (state) => state.flags.SKY_ANIMATED_CLOUDS?.value || false
  )

  const { cloudOpacity, foregroundGradient, backgroundObjects } =
    getSkyboxDef(skybox)
  const frontCloudStyle: React.CSSProperties = {
    ...getCloudPosition(true, scrollPos),
    opacity: cloudOpacity
  }
  const rearCloudStyle: React.CSSProperties = {
    ...getCloudPosition(false, scrollPos),
    opacity: cloudOpacity
  }

  const foregroundStyle: React.CSSProperties = {}
  if (foregroundGradient !== undefined) {
    foregroundStyle.backgroundImage =
      makeCSSGradientDeclaration(foregroundGradient)
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
      <SkyBackground skybox={skybox} />
      <SkyObjects objects={backgroundObjects} />
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
  const speed = isFront ? FRONT_CLOUD_PARALLAX_SPEED : REAR_CLOUD_PARALLAX_SPEED
  const pos = scrollPos * speed

  return {
    backgroundPosition: `-${pos}px 0`
  }
}

export default SkyContainer
