import { IntlProvider, FormattedMessage } from 'react-intl'

import { StreetmixPlusPrompt } from '~/src/app/StreetmixPlusPrompt.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { toggleToolbox } from '~/src/store/slices/ui.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import { TooltipGroup } from '~/src/ui/Tooltip.js'
import { SkyOptions } from './SkyOptions.js'
import { WeatherOptions } from './WeatherOptions.js'
import './SkyPicker.css'

export function SkyPicker() {
  const show = useSelector((state) => state.ui.toolboxVisible ?? false)
  const isSubscriber = useSelector((state) => state.user.isSubscriber ?? false)
  const isUnlocked = useSelector(
    (state) => state.flags.ENVIRONMENTS_UNLOCKED?.value ?? false
  )
  const weatherEnabled = useSelector(
    (state) => state.flags.WEATHER_EFFECTS?.value ?? false
  )
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose(): void {
    dispatch(toggleToolbox())
  }

  const isEnabled = isSubscriber || isUnlocked || coastmixMode

  return (
    <FloatingPanel
      icon="sun"
      title={
        <FormattedMessage
          id="tools.skybox.heading"
          defaultMessage="Environment"
        />
      }
      show={show}
      className="sky-picker"
      handleClose={handleClose}
    >
      <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
        <TooltipGroup>
          <SkyOptions enabled={isEnabled} />
          {(weatherEnabled || coastmixMode) && (
            <WeatherOptions enabled={isEnabled} />
          )}
        </TooltipGroup>
      </IntlProvider>
      {!isEnabled && (
        <div className="sky-picker-upgrade">
          <StreetmixPlusPrompt>
            <FormattedMessage
              id="plus.prompt.text"
              defaultMessage="This feature is only available to Streetmix+ users.&lrm;"
            />
          </StreetmixPlusPrompt>
        </div>
      )}
    </FloatingPanel>
  )
}
