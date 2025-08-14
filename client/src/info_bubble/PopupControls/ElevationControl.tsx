import React from 'react'
import { FormattedMessage } from 'react-intl'

import { segmentsChanged } from '~/src/segments/view'
import {
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '~/src/segments/constants'
import { useSelector, useDispatch } from '~/src/store/hooks'
import { changeSegmentProperties } from '~/src/store/slices/street'
import { TooltipGroup } from '~/src/ui/Tooltip'
import ElevationControlNew from './ElevationControlNew'
import { VariantButton } from './VariantButton'

import type { BoundaryPosition } from '@streetmix/types'

interface ElevationControlProps {
  position: number | BoundaryPosition
}

function ElevationControl ({
  position
}: ElevationControlProps): React.ReactElement {
  const coastmixMode = useSelector((state) => state.flags.COASTMIX_MODE.value)
  const elevation = useSelector((state) => {
    if (position === BUILDING_LEFT_POSITION) {
      return state.street.boundary.left.elevation
    } else if (position === BUILDING_RIGHT_POSITION) {
      return state.street.boundary.right.elevation
    } else {
      return state.street.segments[position].elevation
    }
  })
  const slope = useSelector((state) => {
    if (typeof position === 'number') {
      return state.street.segments[position].slope ?? false
    } else {
      return false
    }
  })

  const dispatch = useDispatch()

  function isVariantCurrentlySelected (selection: string): boolean {
    let bool

    switch (selection) {
      case 'sidewalk': {
        bool = elevation === 1
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
        elevation = 1
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
        slope={slope}
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

export default ElevationControl
