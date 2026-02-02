import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setWeather } from '~/src/store/slices/street.js'
import { Button } from '~/src/ui/Button.js'

import './WeatherOptions.css'

export function WeatherOptions() {
  const { weather } = useSelector((state) => state.street)
  const dispatch = useDispatch()

  function handleSetClear() {
    dispatch(setWeather(null))
  }

  function handleSetRain() {
    // This is a toggle but maybe it shouldn't be
    if (weather === 'rain') {
      dispatch(setWeather(null))
    } else {
      dispatch(setWeather('rain'))
    }
  }

  return (
    <div className="weather-options">
      <h4>Weather</h4>
      <div>
        <Button onClick={handleSetClear}>clear</Button>
        <Button onClick={handleSetRain}>rain</Button>
        <Button>snow</Button>
      </div>
    </div>
  )
}
