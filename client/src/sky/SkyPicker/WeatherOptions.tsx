import { FormattedMessage, useIntl } from 'react-intl'

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
  const intl = useIntl()

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
      <h4>
        <FormattedMessage
          id="tools.skybox.weather.heading"
          defaultMessage="Weather"
        />
      </h4>
      <div className="sky-options" style={{ padding: '0' }}>
        <SkyOptionItem
          label={intl.formatMessage({
            id: `tools.skybox.weather.clear`,
            defaultMessage: 'Clear',
          })}
          isSelected={weather === null}
          isUnlocked={true}
          onClick={handleSetClear}
        >
          <Icon name="clear-day" size="24" />
        </SkyOptionItem>
        <SkyOptionItem
          label={intl.formatMessage({
            id: `tools.skybox.weather.rain`,
            defaultMessage: 'Rain',
          })}
          isSelected={weather === 'rain'}
          isUnlocked={enabled}
          onClick={handleSetRain}
        >
          <Icon name="rain" size="24" />
        </SkyOptionItem>
        {/* <SkyOptionItem
          label={intl.formatMessage({
            id: `tools.skybox.weather.snow`,
            defaultMessage: 'Snow',
          })}
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
