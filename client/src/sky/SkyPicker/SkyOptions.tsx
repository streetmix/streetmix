import React from 'react'
import { IntlProvider, useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSelector } from '~/src/store/hooks'
import Tooltip from '~/src/ui/Tooltip'
import { ICON_LOCK } from '~/src/ui/icons'
import { images } from '~/src/app/load_resources'
import { DEFAULT_SKYBOX } from '../constants'
import { getAllSkyboxDefs } from '..'
import './SkyOptions.scss'

import type { SkyboxDefWithStyles } from '@streetmix/types'

interface SkyOptionsProps {
  enabled: boolean
  selected: string
  handleSelect: (id: string) => void
}

function SkyOptions ({
  enabled,
  selected,
  handleSelect
}: SkyOptionsProps): React.ReactElement {
  const locale = useSelector((state) => state.locale)
  const intl = useIntl()

  function handleClick (
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
        {envs.map((env) => {
          const { id, name, iconStyle } = env
          const classNames = ['sky-option-item']
          const label = intl.formatMessage({
            id: `skybox.${id}`,
            defaultMessage: name
          })

          if (selected === id) {
            classNames.push('sky-selected')
          } else if (!selected && id === DEFAULT_SKYBOX) {
            classNames.push('sky-selected')
          }

          if (!enabled && selected !== id) {
            classNames.push('sky-disabled')
          }

          return (
            <Tooltip label={label} key={id} placement="bottom">
              <button
                aria-label={label}
                className={classNames.join(' ')}
                style={iconStyle}
                onClick={(event) => {
                  handleClick(event, env)
                }}
              >
                {!enabled && selected !== id && (
                  <>
                    <div className="sky-disabled-overlay" />
                    <FontAwesomeIcon icon={ICON_LOCK} />
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
                      userSelect: 'none'
                    }}
                    draggable={false}
                  />
                )}
              </button>
            </Tooltip>
          )
        })}
      </div>
    </IntlProvider>
  )
}

export default SkyOptions
