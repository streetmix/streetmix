import { useIntl } from 'react-intl'
import { getSegmentVariantInfo } from '@streetmix/parts'

import { getBoundaryItem } from '~/src/boundary/boundary.js'
import { useSelector } from '~/src/store/hooks.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { ElevationControlNew } from './ElevationControlNew.js'
import { SlopeToggle } from './SlopeToggle.js'
import { SlopeControl } from './SlopeControl.js'

import type { BoundaryPosition } from '@streetmix/types'

interface CoastmixControlProps {
  position: number | BoundaryPosition
}

export function CoastmixControls({ position }: CoastmixControlProps) {
  const units = useSelector((state) => state.street.units)
  const elevation = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position].elevation
    } else {
      return state.street.boundary[position].elevation
    }
  })
  const slice = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position]
    } else {
      return null
    }
  })
  const isWaterBoundary = useSelector((state) => {
    if (typeof position !== 'number') {
      const variant = state.street.boundary[position].variant
      const definition = getBoundaryItem(variant)
      return definition.waterfront ?? false
    } else {
      return false
    }
  })

  const intl = useIntl()
  const label = isWaterBoundary
    ? intl.formatMessage({
        id: 'segments.controls.sea-level',
        defaultMessage: 'Sea level',
      })
    : intl.formatMessage({
        id: 'segments.controls.ground-height',
        defaultMessage: 'Ground height',
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
        <SlopeControl position={position} />
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
            position={position}
            elevation={elevation}
            units={units}
            seaLevel={isWaterBoundary}
          />
        </div>
      )}
    </>
  )
}
