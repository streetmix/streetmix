import React from 'react'
import { IntlProvider, useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from '../../store/hooks'
import Tooltip from '../../ui/Tooltip'
import { ICON_LOCK } from '../../ui/icons'
import { images } from '../../app/load_resources'
import { DEFAULT_ENVIRONS } from '../constants'
import { getAllEnvirons, type EnvironsRender } from '../environs'
import './EnvironmentSelector.scss'

interface EnvironmentSelectorProps {
  enabled: boolean
  selected: string
  handleSelect: (id: string) => void
}

function EnvironmentSelector ({
  enabled,
  selected,
  handleSelect
}: EnvironmentSelectorProps): React.ReactElement {
  const locale = useSelector((state) => state.locale)
  const intl = useIntl()

  function handleClick (event: React.MouseEvent, env: EnvironsRender): void {
    if (enabled) {
      handleSelect(env.id)
    }
  }

  const envs = getAllEnvirons()

  return (
    <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
      <div className="environment-selector">
        {envs.map((env) => {
          const { id, name, iconStyle } = env
          const classNames = ['environment-item']
          const label = intl.formatMessage({
            id: `environs.${id}`,
            defaultMessage: name
          })

          if (selected === id) {
            classNames.push('environment-active')
          } else if (!selected && id === DEFAULT_ENVIRONS) {
            classNames.push('environment-active')
          }

          if (!enabled && selected !== id) {
            classNames.push('environment-disabled')
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
                    <div className="environment-disabled-overlay" />
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

export default EnvironmentSelector
