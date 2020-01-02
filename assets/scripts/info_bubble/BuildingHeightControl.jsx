import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useIntl } from 'react-intl'
import UpDownInput from './UpDownInput'
import { BUILDINGS, prettifyHeight } from '../segments/buildings'
import {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue
} from '../store/actions/street'
import {
  MAX_BUILDING_HEIGHT,
  BUILDING_LEFT_POSITION,
  BUILDING_RIGHT_POSITION
} from '../segments/constants'

import './BuildingHeightControl.scss'

BuildingHeightControl.propTypes = {
  touch: PropTypes.bool,
  position: PropTypes.oneOf([BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION]),
  variant: PropTypes.string,
  value: PropTypes.number,
  units: PropTypes.number,
  addBuildingFloor: PropTypes.func,
  removeBuildingFloor: PropTypes.func,
  setBuildingFloorValue: PropTypes.func
}

function BuildingHeightControl (props) {
  const intl = useIntl()

  const handleIncrement = () => {
    props.addBuildingFloor(props.position)
  }

  const handleDecrement = () => {
    props.removeBuildingFloor(props.position)
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
      props.setBuildingFloorValue(props.position, value)
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  const displayValueFormatter = (value) => {
    return prettifyHeight(
      props.variant,
      props.position,
      value,
      props.units,
      intl.formatMessage
    )
  }

  const isNotFloored = !BUILDINGS[props.variant].hasFloors

  return (
    <div className="non-variant building-height">
      <UpDownInput
        disabled={isNotFloored}
        value={isNotFloored ? null : props.value}
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
        touch={props.touch}
      />
    </div>
  )
}

function mapStateToProps (state, ownProps) {
  const isLeft = ownProps.position === BUILDING_LEFT_POSITION
  const isRight = ownProps.position === BUILDING_RIGHT_POSITION

  return {
    touch: state.system.touch,

    // Get the appropriate building data based on which side of street it's on
    variant: isLeft
      ? state.street.leftBuildingVariant
      : isRight
        ? state.street.rightBuildingVariant
        : null,
    value: isLeft
      ? state.street.leftBuildingHeight
      : isRight
        ? state.street.rightBuildingHeight
        : null,

    // Units
    units: state.street.units
  }
}

const mapDispatchToProps = {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BuildingHeightControl)
