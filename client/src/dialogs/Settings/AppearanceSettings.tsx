import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setUserColorMode } from '~/src/store/slices/settings.js'
import { Popover } from '~/src/ui/Popover.js'
import RadioGroup from '~/src/ui/RadioGroup.js'
import {
  COLOR_MODE_DARK,
  COLOR_MODE_LIGHT,
  COLOR_MODE_AUTO,
  type ColorModes,
} from '~/src/app/constants.js'

export function AppearanceSettings() {
  return (
    <section>
      <h2>
        <FormattedMessage
          id="settings.appearance.label"
          defaultMessage="Appearance"
        />
      </h2>

      <ColorModeSettings />
    </section>
  )
}

function ColorModeSettings() {
  const colorMode = useSelector((state) => state.settings.colorMode)
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleValueChange(value: ColorModes): void {
    dispatch(setUserColorMode(value))
  }

  return (
    <>
      <h3>
        <FormattedMessage id="settings.theme.label" defaultMessage="Theme" />
        <Popover>
          <FormattedMessage
            id="settings.theme.description"
            defaultMessage="Sets user interface color scheme."
          />
        </Popover>
      </h3>

      <RadioGroup
        name="color-mode"
        value={colorMode}
        defaultValue={COLOR_MODE_LIGHT}
        onValueChange={handleValueChange}
        values={[
          {
            value: COLOR_MODE_LIGHT,
            label: intl.formatMessage({
              id: 'settings.theme.light',
              defaultMessage: 'Light theme',
            }),
          },
          {
            value: COLOR_MODE_DARK,
            label: intl.formatMessage({
              id: 'settings.theme.dark',
              defaultMessage: 'Dark theme',
            }),
          },
          {
            value: COLOR_MODE_AUTO,
            label: intl.formatMessage({
              id: 'settings.theme.system',
              defaultMessage: 'Use system preference',
            }),
          },
        ]}
      />
    </>
  )
}
