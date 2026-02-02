import { useEffect, useRef } from 'react'

import { useSelector } from '../../store/hooks.js'
import { init, stop } from './rain.js'
import './RainCanvas.css'

export function RainCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { isRaining } = useSelector((state) => state.coastmix)

  useEffect(() => {
    if (isRaining && ref.current) {
      init(ref.current)
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [isRaining])

  return <canvas className="rain-canvas" ref={ref} />
}
