import { useIntl } from 'react-intl'

import { useDispatch } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import { Switch } from '~/src/ui/Switch.js'
import { Tooltip } from '~/src/ui/Tooltip.js'

// Slope icon was created in-house, we don't have this in the <Icon /> pipeline
// (yet) (TODO in future if this icon works out)
import slopeIcon from 'url:./icon-slope.svg'

interface SlopeToggleProps {
  position: number
  checked: boolean
  disabled: boolean
}

export function SlopeToggle({ position, checked, disabled }: SlopeToggleProps) {
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleSlopeChange(checked: boolean): void {
    dispatch(toggleSliceSlope(position, checked))
    dispatch(segmentsChanged())
  }

  const label = intl.formatMessage({
    id: 'segments.controls.slope.label',
    defaultMessage: 'Slope',
  })
  const tooltip = intl.formatMessage({
    id: 'segments.controls.slope.switch-tooltip',
    defaultMessage: 'Toggle slope',
  })
  const disabledTooltip = intl.formatMessage({
    id: 'segments.controls.slope.disabled-tooltip',
    defaultMessage: 'This element cannot be sloped.',
  })

  return (
    <div className="popup-control-row" data-tour-id="slope-control">
      <div className="popup-control-label">
        <Tooltip label={label} placement="left" role="label">
          <span className="popup-control-icon">
            <img src={slopeIcon} className="tabler-icon" />
          </span>
        </Tooltip>
      </div>
      <div style={{ flexGrow: '1', display: 'flex', justifyContent: 'center' }}>
        <Tooltip
          label={tooltip}
          sublabel={disabled ? disabledTooltip : undefined}
          placement="bottom"
          role="label"
        >
          <Switch
            onCheckedChange={handleSlopeChange}
            checked={checked}
            disabled={disabled}
            aria-label={label}
          />
        </Tooltip>
      </div>
    </div>
  )
}
