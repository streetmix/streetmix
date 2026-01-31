import { IntlProvider, FormattedMessage } from 'react-intl'

import { StreetmixPlusPrompt } from '~/src/app/StreetmixPlusPrompt.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setSkybox } from '~/src/store/slices/street.js'
import { toggleToolbox } from '~/src/store/slices/ui.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import { DEFAULT_SKYBOX } from '../constants.js'
import { SkyOptions } from './SkyOptions.js'
import { WeatherOptions } from './WeatherOptions.js'
import './SkyPicker.css'

export function SkyPicker() {
  const selected = useSelector((state) => state.street.skybox ?? DEFAULT_SKYBOX)
  const show = useSelector((state) => state.ui.toolboxVisible ?? false)
  const isSubscriber = useSelector((state) => state.user.isSubscriber ?? false)
  const isUnlocked = useSelector(
    (state) => state.flags.ENVIRONMENTS_UNLOCKED?.value ?? false
  )
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose(): void {
    dispatch(toggleToolbox())
  }

  function handleSelect(id: string): void {
    dispatch(setSkybox(id))
  }

  const isEnabled = isSubscriber || isUnlocked

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
        <SkyOptions
          enabled={isEnabled}
          selected={selected}
          handleSelect={handleSelect}
        />
        <WeatherOptions />
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
