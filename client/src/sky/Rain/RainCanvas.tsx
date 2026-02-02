import { useEffect, useRef } from 'react'

import { useSelector } from '../../store/hooks.js'
import { init, stop } from './rain.js'
import './RainCanvas.css'

export function RainCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { weather } = useSelector((state) => state.street)

  useEffect(() => {
    if (weather === 'rain' && ref.current) {
      init(ref.current)
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [weather])

  return <canvas className="rain-canvas" ref={ref} />
}
