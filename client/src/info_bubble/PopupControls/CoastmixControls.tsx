import { useIntl } from 'react-intl'

import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION,
} from '~/src/segments/constants.js'
import { useSelector } from '~/src/store/hooks.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { ElevationControlNew } from './ElevationControlNew.js'
import { SlopeControl } from './SlopeControl.js'

import type { BoundaryPosition } from '@streetmix/types'

interface CoastmixControlProps {
  position: number | BoundaryPosition
}

export function CoastmixControls({ position }: CoastmixControlProps) {
  const units = useSelector((state) => state.street.units)
  const elevation = useSelector((state) => {
    if (position === BUILDING_LEFT_POSITION) {
      return state.street.boundary.left.elevation
    } else if (position === BUILDING_RIGHT_POSITION) {
      return state.street.boundary.right.elevation
    } else {
      return state.street.segments[position].elevation
    }
  })

  const intl = useIntl()
  const label = intl.formatMessage({
    id: 'segments.controls.elevation',
    defaultMessage: 'Elevation',
  })

  return (
    <>
      <div className="popup-control-row" data-tour-id="elevation-control">
        <div className="popup-control-label">
          <Tooltip label={label} placement="left">
            <span className="popup-control-icon">
              <Icon name="elevation" size="30" stroke="1.5" />
            </span>
          </Tooltip>
        </div>
        <ElevationControlNew
          key={position}
          position={position}
          elevation={elevation}
          units={units}
        />
      </div>
      {/* No slope control for boundaries */}
      {typeof position === 'number' && <SlopeControl position={position} />}
    </>
  )
}
