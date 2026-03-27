import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setWeather } from '~/src/store/slices/street.js'
import { Icon } from '~/src/ui/Icon.js'
import { SkyOptionItem } from './SkyOptionItem.js'

import './WeatherOptions.css'

interface WeatherOptionsProps {
  enabled: boolean
}

export function WeatherOptions({ enabled }: WeatherOptionsProps) {
  const { weather } = useSelector((state) => state.street)
  const dispatch = useDispatch()

  function handleSetClear() {
    dispatch(setWeather(null))
  }

  function handleSetRain() {
    if (enabled) {
      dispatch(setWeather('rain'))
    }
  }

  // function handleSetSnow() {
  //   if (enabled) {
  //     dispatch(setWeather('snow'))
  //   }
  // }

  return (
    <div className="weather-options">
      <h4>Weather</h4>
      <div className="sky-options" style={{ padding: '0' }}>
        <SkyOptionItem
          label="Clear"
          isSelected={weather === null}
          isUnlocked={true}
          onClick={handleSetClear}
        >
          <Icon name="clear-day" size="24" />
        </SkyOptionItem>
        <SkyOptionItem
          label="Rain"
          isSelected={weather === 'rain'}
          isUnlocked={enabled}
          onClick={handleSetRain}
        >
          <Icon name="rain" size="24" />
        </SkyOptionItem>
        {/* <SkyOptionItem
          label="Snow"
          isSelected={weather === 'snow'}
          isUnlocked={enabled}
          onClick={handleSetSnow}
        >
          <Icon name="snow" size="24" />
        </SkyOptionItem> */}
      </div>
    </div>
  )
}
