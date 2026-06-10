import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { SlopeControlTemp } from './SlopeControlTemp.js'
// import { SlopeControlPin } from './SlopeControlPin.js'

interface SlopeControlProps {
  position: number
}

export function SlopeControl({ position }: SlopeControlProps) {
  const units = useSelector((state) => state.street.units)
  const slope = useSelector((state) => {
    return state.street.segments[position].slope
  })
  const intl = useIntl()

  const leftLabel = intl.formatMessage({
    id: 'segments.controls.slope.left-label',
    defaultMessage: 'Left ground height',
  })

  const rightLabel = intl.formatMessage({
    id: 'segments.controls.slope.right-label',
    defaultMessage: 'Right ground height',
  })

  return (
    <div className="non-variant" data-tour-id="slope-control-group">
      <div className="popup-control-row">
        <Tooltip label={leftLabel} placement="left" role="label">
          <span className="popup-control-icon">
            <Icon name="slope-left" size="30" stroke="1.5" />
          </span>
        </Tooltip>
        <SlopeControlTemp
          key={position}
          anchor={0}
          position={position}
          elevation={slope.values[0]}
          units={units}
        />
        {/* <SlopeControlPin position={position} anchor={0} /> */}
      </div>
      <div className="popup-control-row">
        <Tooltip label={rightLabel} placement="left" role="label">
          <span className="popup-control-icon">
            <Icon name="slope-right" size="30" stroke="1.5" />
          </span>
        </Tooltip>
        <SlopeControlTemp
          key={position}
          anchor={1}
          position={position}
          elevation={slope.values[1]}
          units={units}
        />
        {/* <SlopeControlPin position={position} anchor={1} /> */}
      </div>
    </div>
  )
}
