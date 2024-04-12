import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import Popover from '../../ui/Popover'
import RadioGroup from '../../ui/RadioGroup'
import { setUserColorMode } from '../../store/slices/settings'
import {
  COLOR_MODE_DARK,
  COLOR_MODE_LIGHT,
  COLOR_MODE_AUTO
} from '../../app/constants'

function AppearanceSettings (props) {
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

function ColorModeSettings (props) {
  const colorMode = useSelector((state) => state.settings.colorMode)
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleValueChange (value) {
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
              defaultMessage: 'Light theme'
            })
          },
          {
            value: COLOR_MODE_DARK,
            label: intl.formatMessage({
              id: 'settings.theme.dark',
              defaultMessage: 'Dark theme'
            })
          },
          {
            value: COLOR_MODE_AUTO,
            label: intl.formatMessage({
              id: 'settings.theme.system',
              defaultMessage: 'Use system preference'
            })
          }
        ]}
      />
    </>
  )
}

export default AppearanceSettings
