import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '../ui/Tooltip'
import { ICON_LOCK } from '../ui/icons'
import { images } from '../app/load_resources'
import { DEFAULT_ENVIRONS } from './constants'
import { getAllEnvirons } from './environs'
import './EnvironmentSelector.scss'

EnvironmentSelector.propTypes = {
  enabled: PropTypes.bool,
  selected: PropTypes.string,
  handleSelect: PropTypes.func
}

function EnvironmentSelector ({ enabled, selected, handleSelect }) {
  const intl = useIntl()

  function handleClick (event, env) {
    if (enabled) {
      handleSelect(env.id)
    }
  }

  const envs = getAllEnvirons()

  return (
    <div className="environment-select-grid">
      {envs.map((env) => {
        const { id, name, iconStyle } = env
        const classNames = ['environment-select']
        const label = intl.formatMessage({
          id: `environs.${name}`,
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
            <div
              className={classNames.join(' ')}
              style={iconStyle}
              onClick={(event) => handleClick(event, env)}
            >
              {!enabled && selected !== id && (
                <>
                  <div className="environment-disabled-overlay" />
                  <FontAwesomeIcon icon={ICON_LOCK} />
                </>
              )}
              {env.iconImage && (
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
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default EnvironmentSelector
