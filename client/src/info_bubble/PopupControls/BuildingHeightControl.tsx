import { useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue,
} from '~/src/store/slices/street.js'
import Icon from '~/src/ui/Icon.js'
import { getBoundaryItem, prettifyHeight } from '~/src/boundary'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
} from '~/src/segments/constants.js'
import { UpDownInput } from './UpDownInput.js'

import type { BoundaryPosition } from '@streetmix/types'

interface BuildingHeightControlProps {
  position: BoundaryPosition
}

export function BuildingHeightControl({
  position,
}: BuildingHeightControlProps) {
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
    <div className="popup-control-button-group">
      <Icon
        name="building-height"
        size="30"
        stroke="1.5"
        className="temp-elev-icon"
      />
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
          defaultMessage: 'Change the number of floors',
        })}
        upTooltip={intl.formatMessage({
          id: 'tooltip.add-floor',
          defaultMessage: 'Add floor',
        })}
        downTooltip={intl.formatMessage({
          id: 'tooltip.remove-floor',
          defaultMessage: 'Remove floor',
        })}
        allowAutoUpdate
      />
    </div>
  )
}
