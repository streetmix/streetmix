import { useEffect } from 'react'

import { useSelector } from '../../store/hooks.js'
import { demo } from './rain.js'
import './RainCanvas.css'

export function RainCanvas() {
  const { isRaining } = useSelector((state) => state.coastmix)

  useEffect(() => {
    if (isRaining) {
      demo.init()
    } else {
      demo.stop()
    }

    return () => {
      demo.stop()
    }
  }, [isRaining])

  return <canvas id="rain-canvas" />
}
