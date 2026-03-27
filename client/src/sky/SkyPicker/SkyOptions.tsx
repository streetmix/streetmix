import { useIntl } from 'react-intl'

import { TooltipGroup } from '~/src/ui/Tooltip.js'
import { DEFAULT_SKYBOX } from '../constants.js'
import { getAllSkyboxDefs } from '..'
import { SkyOptionItem } from './SkyOptionItem.js'
import './SkyOptions.css'

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
  const intl = useIntl()
  const envs = getAllSkyboxDefs()

  function handleClick(id: string): void {
    if (enabled) {
      handleSelect(id)
    }
  }

  return (
    <div className="sky-options">
      <TooltipGroup>
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
                handleClick(id)
              }}
            />
          )
        })}
      </TooltipGroup>
    </div>
  )
}
