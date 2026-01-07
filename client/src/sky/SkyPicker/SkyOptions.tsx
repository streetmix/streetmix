import { IntlProvider, useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import Icon from '~/src/ui/Icon.js'
import { Tooltip, TooltipGroup } from '~/src/ui/Tooltip.js'
import { images } from '~/src/app/load_resources.js'
import { DEFAULT_SKYBOX } from '../constants.js'
import { getAllSkyboxDefs } from '..'
import './SkyOptions.css'

import type { SkyboxDefWithStyles } from '@streetmix/types'

interface SkyOptionsProps {
  enabled: boolean
  selected: string
  handleSelect: (id: string) => void
}

export function SkyOptions({
  enabled,
  selected,
  handleSelect,
}: SkyOptionsProps) {
  const locale = useSelector((state) => state.locale)
  const intl = useIntl()

  function handleClick(
    event: React.MouseEvent,
    env: SkyboxDefWithStyles
  ): void {
    if (enabled) {
      handleSelect(env.id)
    }
  }

  const envs = getAllSkyboxDefs()

  return (
    <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
      <div className="sky-options">
        <TooltipGroup>
          {envs.map((env) => {
            const { id, name, iconStyle } = env
            const classNames = ['sky-option-item']
            const label = intl.formatMessage({
              id: `skybox.${id}`,
              defaultMessage: name,
            })

            if (selected === id) {
              classNames.push('sky-selected')
            } else if (!selected && id === DEFAULT_SKYBOX) {
              classNames.push('sky-selected')
            }

            const isDisabled = !enabled && selected !== id

            return (
              <Tooltip label={label} key={id} placement="bottom">
                <button
                  aria-label={label}
                  className={classNames.join(' ')}
                  style={iconStyle}
                  onClick={(event) => {
                    handleClick(event, env)
                  }}
                  disabled={isDisabled}
                >
                  {isDisabled && (
                    <>
                      <div className="sky-option-disabled-overlay" />
                      <Icon name="lock" />
                    </>
                  )}
                  {env.iconImage !== undefined && (
                    <img
                      src={images.get(env.iconImage)?.src}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                      draggable={false}
                    />
                  )}
                </button>
              </Tooltip>
            )
          })}
        </TooltipGroup>
      </div>
    </IntlProvider>
  )
}
