import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks'
import {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue
} from '~/src/store/slices/street'
import { getBoundaryItem } from '~/src/boundary'
import { prettifyHeight } from '~/src/segments/buildings'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION
} from '~/src/segments/constants'
import UpDownInput from './UpDownInput'
import './BuildingHeightControl.css'

import type { BoundaryPosition } from '@streetmix/types'

interface BuildingHeightControlProps {
  position: BoundaryPosition
}

function BuildingHeightControl ({
  position
}: BuildingHeightControlProps): React.ReactElement {
  const units = useSelector((state) => state.street.units)

  // Get the appropriate building data based on which side of street it's on
  const variant = useSelector((state) =>
    position === BUILDING_LEFT_POSITION
      ? state.street.boundary.left.variant
      : state.street.boundary.right.variant
  )
  const value = useSelector((state) =>
    position === BUILDING_LEFT_POSITION
      ? state.street.boundary.left.floors
      : state.street.boundary.right.floors
  )

  const dispatch = useDispatch()
  const intl = useIntl()

  const handleIncrement = (): void => {
    dispatch(addBuildingFloor(position))
  }

  const handleDecrement = (): void => {
    dispatch(removeBuildingFloor(position))
  }

  const updateModel = (value: string): void => {
    if (value) {
      dispatch(setBuildingFloorValue(position, value))
    }
  }

  const displayValueFormatter = (value: number): string => {
    return prettifyHeight(variant, position, value, units, intl.formatMessage)
  }

  const hasFloors = getBoundaryItem(variant).hasFloors

  return (
    <div className="non-variant building-height">
      <UpDownInput
        disabled={!hasFloors}
        value={hasFloors ? value : null}
        minValue={1}
        maxValue={MAX_BUILDING_HEIGHT}
        displayValueFormatter={displayValueFormatter}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
        onUpdatedValue={updateModel}
        inputTooltip={intl.formatMessage({
          id: 'tooltip.building-height',
          defaultMessage: 'Change the number of floors'
        })}
        upTooltip={intl.formatMessage({
          id: 'tooltip.add-floor',
          defaultMessage: 'Add floor'
        })}
        downTooltip={intl.formatMessage({
          id: 'tooltip.remove-floor',
          defaultMessage: 'Remove floor'
        })}
        allowAutoUpdate
      />
    </div>
  )
}

export default BuildingHeightControl
