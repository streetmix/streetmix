import React from 'react'
import { FormattedMessage } from 'react-intl'

import { segmentsChanged } from '~/src/segments/view'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION,
  CURB_HEIGHT,
  CURB_HEIGHT_IMPERIAL
} from '~/src/segments/constants'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import { TooltipGroup } from '~/src/ui/Tooltip'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants'
import { ElevationControlNew } from './ElevationControlNew'
import { VariantButton } from './VariantButton'

import type { BoundaryPosition } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
}

export function ElevationControl ({
  position
}: ElevationControlProps): React.ReactElement {
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)
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

  const dispatch = useDispatch()

  function isVariantCurrentlySelected (selection: string): boolean {
    let bool

    // TODO: remove when elevation work is complete
    // I think this is only null in buggy cases
    if (elevation === null) return false

    switch (selection) {
      case 'sidewalk': {
        // Quickly convert both metric and imperial values to 0.15
        bool = +elevation.toFixed(2) === CURB_HEIGHT
        break
      }
      case 'road':
        bool = elevation === 0
        break
      default:
        bool = false
        break
    }

    return bool
  }

  function getButtonOnClickHandler (selection: string): () => void {
    let elevation: number
    switch (selection) {
      case 'sidewalk':
        elevation =
          units === SETTINGS_UNITS_IMPERIAL ? CURB_HEIGHT_IMPERIAL : CURB_HEIGHT
        break
      case 'road':
        elevation = 0
        break
    }

    return (): void => {
      if (typeof position === 'number') {
        dispatch(changeSegmentProperties(position, { elevation }))
        segmentsChanged()
      }
    }
  }

  function renderButton (
    set: string,
    selection: string
  ): React.ReactElement | null {
    return (
      <VariantButton
        set={set}
        selection={selection}
        isSelected={isVariantCurrentlySelected(selection)}
        onClick={getButtonOnClickHandler(selection)}
      />
    )
  }

  let controls
  if (coastmixMode) {
    controls = (
      <ElevationControlNew
        key={position}
        position={position}
        elevation={elevation}
        units={units}
      />
    )
  } else {
    controls = (
      <div className="variants popup-control-button-group">
        <TooltipGroup>
          {renderButton('universal-elevation', 'sidewalk')}
          {renderButton('universal-elevation', 'road')}
        </TooltipGroup>
      </div>
    )
  }

  return (
    <div className="popup-control-row">
      <div className="popup-control-label">
        <FormattedMessage
          id="segments.controls.elevation"
          defaultMessage="Elevation"
        />
      </div>
      {controls}
    </div>
  )
}
