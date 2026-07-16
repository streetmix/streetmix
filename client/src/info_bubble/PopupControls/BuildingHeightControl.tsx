import { useIntl } from 'react-intl'
import { getBoundaryItem } from '@streetmix/parts'
import { prettifyWidth } from '@streetmix/utils'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue,
} from '~/src/store/slices/street.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { prettifyHeight } from '~/src/boundary'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
} from '~/src/segments/constants.js'
import { UpDownInput } from './UpDownInput.js'
import './BuildingHeightControl.css'

import type { BoundaryPosition } from '@streetmix/types'

interface BuildingHeightControlProps {
  position: BoundaryPosition
}

export function BuildingHeightControl({
  position,
}: BuildingHeightControlProps) {
  const units = useSelector((state) => state.street.units)
  const locale = useSelector((state) => state.locale.locale)

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

  // showFloors is present only when hasFloors is true. This assignment
  // type-checks, whereas a simple destructuring from getBoundaryItem won't.
  const boundaryItem = getBoundaryItem(variant)
  const hasFloors = boundaryItem.hasFloors
  const showFloors = boundaryItem.hasFloors
    ? (boundaryItem.showFloors ?? true)
    : false

  const displayValueFormatter = (value: number): string => {
    if (showFloors === false) {
      return prettifyWidth(value, units, locale)
    }

    return prettifyHeight(
      variant,
      position,
      value,
      units,
      locale,
      intl.formatMessage
    )
  }

  const tooltip = showFloors
    ? intl.formatMessage({
        id: 'building.label',
        defaultMessage: 'Building height',
      })
    : intl.formatMessage({
        id: 'building.label2',
        defaultMessage: 'Height',
      })
  const inputTooltip = showFloors
    ? intl.formatMessage({
        id: 'tooltip.building-height',
        defaultMessage: 'Change the number of floors',
      })
    : intl.formatMessage({
        id: 'tooltip.height-input',
        defaultMessage: 'Change height',
      })
  const upTooltip = showFloors
    ? intl.formatMessage({
        id: 'tooltip.add-floor',
        defaultMessage: 'Add floor',
      })
    : intl.formatMessage({
        id: 'tooltip.height-raise',
        defaultMessage: 'Raise height',
      })
  const downTooltip = showFloors
    ? intl.formatMessage({
        id: 'tooltip.remove-floor',
        defaultMessage: 'Remove floor',
      })
    : intl.formatMessage({
        id: 'tooltip.height-lower',
        defaultMessage: 'Lower height',
      })

  return (
    <div className="popup-control-row">
      <Tooltip label={tooltip} placement="left" role="label">
        <span className="popup-control-icon">
          <Icon name="building-height" size="30" stroke="1.5" />
        </span>
      </Tooltip>
      <UpDownInput
        disabled={!hasFloors}
        value={hasFloors ? value : null}
        minValue={1}
        maxValue={MAX_BUILDING_HEIGHT}
        displayValueFormatter={displayValueFormatter}
        onClickUp={handleIncrement}
        onClickDown={handleDecrement}
        onUpdatedValue={updateModel}
        inputTooltip={inputTooltip}
        upTooltip={upTooltip}
        downTooltip={downTooltip}
        allowAutoUpdate
        className="boundary-height-control"
      />
    </div>
  )
}
