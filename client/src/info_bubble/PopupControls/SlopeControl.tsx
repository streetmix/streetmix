import { useIntl } from 'react-intl'

import { useDispatch } from '~/src/store/hooks.js'
import { segmentsChanged } from '~/src/store/actions/street.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import { Icon } from '~/src/ui/Icon.js'
import { Switch } from '~/src/ui/Switch.js'
import { Tooltip } from '~/src/ui/Tooltip.js'

interface SlopeControlProps {
  position: number
  checked: boolean
  disabled: boolean
}

export function SlopeControl({
  position,
  checked,
  disabled,
}: SlopeControlProps) {
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

  return (
    <div className="popup-control-row" data-tour-id="slope-control">
      <div className="popup-control-label">
        <Tooltip label={label} placement="left" role="label">
          <span className="popup-control-icon">
            <Icon name="slope" size="30" stroke="1.5" />
          </span>
        </Tooltip>
      </div>
      <Tooltip label={tooltip} placement="bottom" role="label">
        <Switch
          onCheckedChange={handleSlopeChange}
          checked={checked}
          disabled={disabled}
          aria-label={label}
          data-tour-id="slope-control-switch"
        />
      </Tooltip>
    </div>
  )
}
