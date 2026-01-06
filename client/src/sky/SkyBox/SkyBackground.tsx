import { useTransition, animated } from '@react-spring/web'

import { getSkyboxDef } from '..'
import './SkyBackground.css'

interface SkyBackgroundProps {
  skybox: string
}

export function SkyBackground(props: SkyBackgroundProps) {
  const { skybox } = props

  const transitions = useTransition(skybox, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 500,
    },
  })

  return (
    <div className="sky-background">
      {transitions((style, item) => (
        <animated.div
          className="sky-background-color"
          style={{ ...style, ...getSkyboxDef(item).style }}
        />
      ))}
    </div>
  )
}
