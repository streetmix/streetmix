import { useEffect, useRef } from 'react'

import { useSelector } from '../../store/hooks.js'
import { initSnow, stopSnow } from './snow.js'
import { initRain, stopRain } from './rain.js'
import './WeatherCanvas.css'

export function WeatherCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { weather } = useSelector((state) => state.street)

  useEffect(() => {
    if (weather === 'rain' && ref.current) {
      initRain(ref.current)
    } else {
      stopRain()
    }

    if (weather === 'snow' && ref.current) {
      initSnow(ref.current)
    } else {
      stopSnow()
    }

    return () => {
      stopRain()
      stopSnow()
    }
  }, [weather])

  return <canvas className="weather-canvas" ref={ref} />
}
