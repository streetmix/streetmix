import { useEffect, useRef } from 'react'

import { useSelector } from '../../store/hooks.js'
import { init, stop } from './snow.js'
import './SnowCanvas.css'

export function SnowCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { weather } = useSelector((state) => state.street)

  useEffect(() => {
    if (weather === 'snow' && ref.current) {
      init(ref.current)
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [weather])

  return <canvas className="snow-canvas" ref={ref} />
}
