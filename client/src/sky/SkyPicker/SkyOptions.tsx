import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setSkybox } from '~/src/store/slices/street.js'
import { DEFAULT_SKYBOX } from '../constants.js'
import { getAllSkyboxDefs } from '..'
import { SkyOptionItem } from './SkyOptionItem.js'
import './SkyOptions.css'

interface SkyOptionsProps {
  enabled: boolean
}

export function SkyOptions({ enabled }: SkyOptionsProps) {
  const selected = useSelector((state) => state.street.skybox ?? DEFAULT_SKYBOX)
  const dispatch = useDispatch()
  const intl = useIntl()
  const envs = getAllSkyboxDefs()

  function handleSelect(id: string): void {
    if (enabled) {
      dispatch(setSkybox(id))
    }
  }

  return (
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
  )
}
