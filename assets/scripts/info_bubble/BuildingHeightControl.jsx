import React from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import UpDownInput from './UpDownInput'
import { BUILDINGS, prettifyHeight } from '../segments/buildings'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'
import {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue
} from '../store/slices/street'
import './BuildingHeightControl.scss'

BuildingHeightControl.propTypes = {
  position: PropTypes.oneOf([BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION])
}

function BuildingHeightControl ({ position }) {
  const units = useSelector((state) => state.street.units)

  // Get the appropriate building data based on which side of street it's on
  const variant = useSelector((state) =>
    position === BUILDING_LEFT_POSITION
      ? state.street.leftBuildingVariant
      : position === BUILDING_RIGHT_POSITION
        ? state.street.rightBuildingVariant
        : null
  )
  const value = useSelector((state) =>
    position === BUILDING_LEFT_POSITION
      ? state.street.leftBuildingHeight
      : position === BUILDING_RIGHT_POSITION
        ? state.street.rightBuildingHeight
        : null
  )

  const dispatch = useDispatch()
  const intl = useIntl()

  const handleIncrement = () => {
    dispatch(addBuildingFloor(position))
  }

  const handleDecrement = () => {
    dispatch(removeBuildingFloor(position))
  }

  /**
   * When given a new value from input, process it, then update the model.
   *
   * If the input must be debounced, used the debounced function instead.
   *
   * @param {string} value - raw input
   */
  const updateModel = (value) => {
    if (value) {
      dispatch(setBuildingFloorValue(position, value))
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  const displayValueFormatter = (value) => {
    return prettifyHeight(variant, position, value, units, intl.formatMessage)
  }

  const isNotFloored = !BUILDINGS[variant].hasFloors

  return (
    <div className="non-variant building-height">
      <UpDownInput
        disabled={isNotFloored}
        value={isNotFloored ? null : value}
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
        allowAutoUpdate={true}
      />
    </div>
  )
}

export default BuildingHeightControl
