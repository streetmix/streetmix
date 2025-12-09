import React from 'react'
import { FormattedMessage } from 'react-intl'

import { segmentsChanged } from '~/src/segments/view.js'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION,
  CURB_HEIGHT,
  CURB_HEIGHT_IMPERIAL,
} from '~/src/segments/constants.js'
import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { changeSegmentProperties } from '~/src/store/slices/street.js'
import { TooltipGroup } from '~/src/ui/Tooltip.js'
import { SETTINGS_UNITS_IMPERIAL } from '~/src/users/constants.js'
import { ElevationControlNew } from './ElevationControlNew.js'
import { VariantButton } from './VariantButton.js'

import type { BoundaryPosition } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
}

export function ElevationControl({ position }: ElevationControlProps) {
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

  function isVariantCurrentlySelected(selection: string): boolean {
    let bool

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

  function getButtonOnClickHandler(selection: string): React.MouseEventHandler {
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

    return () => {
      if (typeof position === 'number') {
        dispatch(changeSegmentProperties(position, { elevation }))
        segmentsChanged()
      }
    }
  }

  function renderButton(set: string, selection: string) {
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
