import { useEffect } from 'react'

import { demo } from './rain.js'
import './RainCanvas.css'

export function RainCanvas() {
  useEffect(() => {
    demo.init()
  }, [])

  return <canvas id="rain-canvas" />
}
