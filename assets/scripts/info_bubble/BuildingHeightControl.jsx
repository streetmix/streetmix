import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl, intlShape } from 'react-intl'
import UpDownInput from './UpDownInput'
import { MAX_BUILDING_HEIGHT, BUILDINGS, prettifyHeight } from '../segments/buildings'
import { addBuildingFloor, removeBuildingFloor, setBuildingFloorValue } from '../store/actions/street'
import './BuildingHeightControl.scss'

class BuildingHeightControl extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    touch: PropTypes.bool,
    position: PropTypes.oneOf(['left', 'right']),
    variant: PropTypes.string,
    value: PropTypes.number,
    units: PropTypes.number,
    addBuildingFloor: PropTypes.func,
    removeBuildingFloor: PropTypes.func,
    setBuildingFloorValue: PropTypes.func
  }

  handleIncrement = () => {
    this.props.addBuildingFloor(this.props.position)
  }

  handleDecrement = () => {
    this.props.removeBuildingFloor(this.props.position)
  }

  /**
   * When given a new value from input, process it, then update the model.
   *
   * If the input must be debounced, used the debounced function instead.
   *
   * @param {string} value - raw input
   */
  updateModel = (value) => {
    if (value) {
      this.props.setBuildingFloorValue(this.props.position, value)
    }
  }

  /**
   * Given a raw numerical value, format it and return a decorated string.
   *
   * @param {Number} value - raw value
   * @returns {string} - a decorated value
   */
  displayValueFormatter = (value) => {
    return prettifyHeight(this.props.variant, this.props.position, value, this.props.units, this.props.intl.formatMessage)
  }

  render () {
    const isNotFloored = !BUILDINGS[this.props.variant].hasFloors

    return (
      <div className="non-variant building-height">
        <UpDownInput
          disabled={isNotFloored}
          value={isNotFloored ? null : this.props.value}
          minValue={1}
          maxValue={MAX_BUILDING_HEIGHT}
          displayValueFormatter={this.displayValueFormatter}
          onClickUp={this.handleIncrement}
          onClickDown={this.handleDecrement}
          onUpdatedValue={this.updateModel}
          inputTooltip={this.props.intl.formatMessage({
            id: 'tooltip.building-height',
            defaultMessage: 'Change the number of floors'
          })}
          upTooltip={this.props.intl.formatMessage({
            id: 'tooltip.add-floor',
            defaultMessage: 'Add floor'
          })}
          downTooltip={this.props.intl.formatMessage({
            id: 'tooltip.remove-floor',
            defaultMessage: 'Remove floor'
          })}
          touch={this.props.touch}
        />
      </div>
    )
  }
}

function mapStateToProps (state, ownProps) {
  const isLeft = ownProps.position === 'left'
  const isRight = ownProps.position === 'right'

  return {
    touch: state.system.touch,

    // Get the appropriate building data based on which side of street it's on
    variant: (isLeft) ? state.street.leftBuildingVariant : (isRight) ? state.street.rightBuildingVariant : null,
    value: (isLeft) ? state.street.leftBuildingHeight : (isRight) ? state.street.rightBuildingHeight : null,

    // Units
    units: state.street.units
  }
}

const actionCreators = {
  addBuildingFloor,
  removeBuildingFloor,
  setBuildingFloorValue
}

export default injectIntl(connect(mapStateToProps, actionCreators)(BuildingHeightControl))
