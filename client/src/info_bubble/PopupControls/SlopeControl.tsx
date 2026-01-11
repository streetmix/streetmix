import { useIntl } from 'react-intl'
import { getSegmentVariantInfo } from '@streetmix/parts'

import { segmentsChanged } from '~/src/segments/view.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { toggleSliceSlope } from '~/src/store/slices/street.js'
import Icon from '~/src/ui/Icon'
import { Switch } from '~/src/ui/Switch.js'
import { Tooltip } from '~src/ui/Tooltip'

interface SlopeControlProps {
  position: number
}

export function SlopeControl({ position }: SlopeControlProps) {
  // TODO: consider passing slice and slice info into this component, one
  // level up -- because other sibling components may need it too
  const slice = useSelector((state) => {
    return state.street.segments[position]
  })
  const dispatch = useDispatch()
  const intl = useIntl()

  // Allow sloping when slope rule is `path` or `berm`. Defaults to false.
  const { slope } = getSegmentVariantInfo(slice.type, slice.variantString)
  const allowSlope = slope === 'path' || slope === 'berm'
  const isSloped = allowSlope && slice.slope.on

  function handleSlopeChange(checked: boolean): void {
    dispatch(toggleSliceSlope(position, checked))
    segmentsChanged()
  }

  if (!allowSlope) return null

  const label = intl.formatMessage({
    id: 'segments.controls.slope.label',
    defaultMessage: 'Slope',
  })
  const tooltip = intl.formatMessage({
    id: 'segments.controls.slope.switch-tooltip',
    defaultMessage: 'Toggle slope',
  })

  return (
    <div className="popup-control-button-group">
      <div className="popup-control-label">
        <Tooltip label={label} placement="left">
          <span style={{ lineHeight: 0 }}>
            <Icon
              name="slope"
              size="30"
              stroke="1.5"
              className="temp-elev-icon"
            />
          </span>
        </Tooltip>
      </div>
      <Tooltip label={tooltip} placement="bottom">
        <Switch
          onCheckedChange={handleSlopeChange}
          checked={isSloped}
          disabled={!allowSlope}
          aria-label={label}
          style={{
            width: '39px',
            height: '21px',
          }}
        />
      </Tooltip>
    </div>
  )
}
