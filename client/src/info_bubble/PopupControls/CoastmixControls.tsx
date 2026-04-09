import { useIntl } from 'react-intl'
import { getSegmentVariantInfo } from '@streetmix/parts'

import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION,
} from '~/src/segments/constants.js'
import { useSelector } from '~/src/store/hooks.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { ElevationControlNew } from './ElevationControlNew.js'
import { SlopeToggle } from './SlopeToggle.js'

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

  // TODO: consider passing slice and slice info into this component, one
  // level up -- because other sibling components may need it too
  const slice = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position]
    } else {
      return null
    }
  })

  const intl = useIntl()
  const label = intl.formatMessage({
    id: 'segments.controls.height',
    defaultMessage: 'Height',
  })

  // Allow sloping when slope rule is `path` or `berm`. Defaults to false.
  let isSloped = false
  let allowSlope = false
  if (slice) {
    const info = getSegmentVariantInfo(slice.type, slice.variantString)
    if (!('unknown' in info)) {
      allowSlope = info.slope === 'path' || info.slope === 'berm'
      isSloped = allowSlope && slice.slope.on
    }
  }

  return (
    <>
      {/* No slope control for boundaries */}
      {typeof position === 'number' && (
        <SlopeToggle
          position={position}
          checked={isSloped}
          disabled={!allowSlope}
        />
      )}
      {isSloped ? (
        <div className="popup-control-row" data-tour-id="elevation-control">
          <div className="popup-control-label">slope placeholder</div>
        </div>
      ) : (
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
      )}
    </>
  )
}
