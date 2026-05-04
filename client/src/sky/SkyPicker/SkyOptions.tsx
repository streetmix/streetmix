import { FormattedMessage, IntlProvider, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setSkybox } from '~/src/store/slices/street.js'
import { DEFAULT_SKYBOX } from '../constants.js'
import { getAllSkyboxDefs } from '..'
import { SkyOptionItem } from './SkyOptionItem.js'

interface SkyOptionsProps {
  enabled: boolean
}

export function SkyOptions({ enabled }: SkyOptionsProps) {
  const locale = useSelector((state) => state.locale)
  const selected = useSelector((state) => state.street.skybox ?? DEFAULT_SKYBOX)
  const weatherEnabled = useSelector(
    (state) => state.flags.WEATHER_EFFECTS?.value ?? false
  )
  const coastmixMode = useSelector(
    (state) => state.flags.COASTMIX_MODE?.value ?? false
  )
  const dispatch = useDispatch()
  const intl = useIntl()
  const envs = getAllSkyboxDefs()

  function handleSelect(id: string): void {
    if (enabled) {
      dispatch(setSkybox(id))
    }
  }

  const showHeading = weatherEnabled || coastmixMode

  return (
    <div
      className="sky-options-group"
      style={{ marginTop: showHeading ? '0' : undefined }}
    >
      {showHeading && (
        <h4>
          <FormattedMessage
            id="tools.skybox.sky.heading"
            defaultMessage="Sky"
          />
        </h4>
      )}
      <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
        <div className="sky-options">
          {envs.map((env) => {
            const { id, name, iconImage, iconStyle } = env
            const label = intl.formatMessage({
              id: `skybox.${id}`,
              defaultMessage: name,
            })

            const isSelected =
              selected === id || (!selected && id === DEFAULT_SKYBOX)

            return (
              <SkyOptionItem
                key={id}
                label={label}
                iconImage={iconImage}
                iconStyle={iconStyle}
                isSelected={isSelected}
                isUnlocked={enabled}
                onClick={(_event) => {
                  handleSelect(id)
                }}
              />
            )
          })}
        </div>
      </IntlProvider>
    </div>
  )
}
