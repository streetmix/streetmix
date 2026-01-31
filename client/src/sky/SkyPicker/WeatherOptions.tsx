import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setRain } from '~/src/store/slices/coastmix.js'
import { Button } from '~/src/ui/Button.js'

import './WeatherOptions.css'

export function WeatherOptions() {
  const { isRaining } = useSelector((state) => state.coastmix)
  const dispatch = useDispatch()

  function handleSetClear() {
    dispatch(setRain(false))
  }

  function handleSetRain() {
    // maybe this should just be true
    dispatch(setRain(!isRaining))
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
