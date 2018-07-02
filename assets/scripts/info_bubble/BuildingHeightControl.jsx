import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl, intlShape } from 'react-intl'
import { debounce } from 'lodash'
import { MAX_BUILDING_HEIGHT, BUILDINGS, calculateRealHeightNumber } from '../segments/buildings'
import { addBuildingFloor, removeBuildingFloor, setBuildingFloorValue } from '../store/actions/street'
import { prettifyWidth } from '../util/width_units'
import { KEYS } from '../app/keyboard_commands'
import { loseAnyFocus } from '../util/focus'

const WIDTH_EDIT_INPUT_DELAY = 200

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

  constructor (props) {
    super(props)

    this.oldValue = null
    this.inputEl = null

    this.state = {
      isEditing: false,
      displayValue: this.prettifyHeight(props.variant, props.position, props.value)
    }
  }

  /**
   * If UI is not in user-editing mode, update the display
   * when the value in store changes
   *
   * @param {Object} nextProps
   */
  componentWillReceiveProps (nextProps) {
    if (!this.state.isEditing) {
      this.setState({
        displayValue: this.prettifyHeight(nextProps.variant, nextProps.position, nextProps.value)
      })
    }
  }

  /**
   * If UI is going to enter user-editing mode, immediately
   * save the previous value in case editing is cancelled
   *
   * @param {Object} prevProps
   * @param {Object} prevState
   */
  componentDidUpdate (prevProps, prevState) {
    if (!prevState.isEditing && this.state.isEditing) {
      this.oldValue = this.props.value
    }
  }

  onClickIncrement = () => {
    this.props.addBuildingFloor(this.props.position)
  }

  onClickDecrement = () => {
    this.props.removeBuildingFloor(this.props.position)
  }

  onInput = (event) => {
    const value = event.target.value

    // Update the input element to display user input
    this.setState({
      isEditing: true,
      displayValue: value
    })

    // Update the model, but debounce inputs to prevent thrashing
    this.debouncedUpdateModel(value)
  }

  onClickInput = (event) => {
    const el = event.target

    this.setState({
      isEditing: true,
      displayValue: this.props.value
    })

    if (document.activeElement !== el) {
      el.select()
    }
  }

  onDoubleClickInput = (event) => {
    const el = event.target
    el.select()
  }

  onFocusInput = (event) => {
    const el = event.target

    if (document.activeElement !== el) {
      el.select()
    }
  }

  /**
   * On blur, input shows prettified value.
   */
  onBlurInput = (event) => {
    this.setState({
      isEditing: false,
      displayValue: this.prettifyHeight(this.props.variant, this.props.position, this.props.value)
    })
  }

  /**
   * Prevent mousedown event from resetting the input view.
   */
  onMouseDownInput = (event) => {
    this.setState({
      isEditing: true,
      displayValue: this.props.value
    })
  }

  /**
   * On mouse over, UI assumes user is ready to edit.
   */
  onMouseOverInput = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      displayValue: this.props.value
    })

    // Automatically select the value on hover so that it's easy to start typing new values.
    // In React, this only works if the .select() is called at the end of the execution
    // stack, so we put it inside a setTimeout() with a timeout of zero. We also must
    // store the reference to the event target because the React synthetic event will
    // not persist into the setTimeout function.
    const target = event.target
    window.setTimeout(() => {
      target.focus()
      target.select()
    }, 0)
  }

  /**
   * On mouse out, if user is not editing, UI returns to default view.
   */
  onMouseOutInput = (event) => {
    // Bail if already in editing mode.
    if (this.state.isEditing) return

    this.setState({
      displayValue: this.prettifyHeight(this.props.variant, this.props.position, this.props.value)
    })

    event.target.blur()
  }

  onKeyDownInput = (event) => {
    switch (event.keyCode) {
      case KEYS.ENTER:
        this.updateModel(event.target.value)
        this.setState({
          isEditing: false
        })

        this.inputEl.focus()
        this.inputEl.select()

        break
      // TODO: this is bugged; escape key is not firing currently
      case KEYS.ESC:
        this.updateModel(this.oldValue)
        loseAnyFocus()
        break
    }
  }

  /**
   * When given a new value from input, process it, then update the model.
   *
   * If the input must be debounced, used the debounced function instead.
   *
   * @param {string} value - raw input
   */
  updateModel = (value) => {
    this.props.setBuildingFloorValue(this.props.position, value)
  }

  /**
   * Debounced version of this.updateModel(). Call this instead of the
   * undebounced function to prevent thrashing of model and layout.
   */
  debouncedUpdateModel = debounce(this.updateModel, WIDTH_EDIT_INPUT_DELAY)

  /**
   * Given a building, return a string showing number of floors and actual height measurement
   * e.g. when height value is `4` return a string that looks like this:
   *    "4 floors (45m)"
   *
   * @todo Localize return value
   * @param {string} variant - what type of building is it
   * @param {string} position - what side is it on (left or right)
   * @param {Number} floors - number of floors
   * @param {string} text - text string to display
   */
  prettifyHeight = (variant, position, floors) => {
    let text = this.props.intl.formatMessage({
      id: 'building.floors-count',
      defaultMessage: '{count, plural, one {# floor} other {# floors}}'
    }, {
      count: floors
    })

    const realHeight = calculateRealHeightNumber(variant, position, floors)
    const prettifiedHeight = prettifyWidth(realHeight, this.props.units)

    text += ` (${prettifiedHeight})`

    return text
  }

  render () {
    const isNotFloored = !BUILDINGS[this.props.variant].hasFloors

    const inputEl = (this.props.touch) ? (
      <span className="height-non-editable">{this.state.displayValue}</span>
    ) : (
      <input
        type="text"
        className="height"
        title={this.props.intl.formatMessage({ id: 'tooltip.building-height', defaultMessage: 'Change the number of floors' })}
        disabled={isNotFloored}
        value={isNotFloored ? '' : this.state.displayValue}
        onChange={this.onInput}
        onClick={this.onClickInput}
        onDoubleClick={this.onDoubleClickInput}
        onFocus={this.onFocusInput}
        onBlur={this.onBlurInput}
        onMouseDown={this.onMouseDownInput}
        onMouseOver={this.onMouseOverInput}
        onMouseOut={this.onMouseOutInput}
        onKeyDown={this.onKeyDownInput}
        ref={(ref) => { this.inputEl = ref }}
      />
    )

    return (
      <div className="non-variant building-height">
        <button
          className="increment"
          title={this.props.intl.formatMessage({ id: 'tooltip.add-floor', defaultMessage: 'Add floor' })}
          tabIndex={-1}
          onClick={this.onClickIncrement}
          disabled={isNotFloored || (this.props.value >= MAX_BUILDING_HEIGHT)}
        >
          <FontAwesomeIcon icon="plus" />
        </button>
        {inputEl}
        <button
          className="decrement"
          title={this.props.intl.formatMessage({ id: 'tooltip.remove-floor', defaultMessage: 'Remove floor' })}
          tabIndex={-1}
          onClick={this.onClickDecrement}
          disabled={isNotFloored || (this.props.value <= 1)}
        >
          <FontAwesomeIcon icon="minus" />
        </button>
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

function mapDispatchToProps (dispatch) {
  return {
    addBuildingFloor: (position) => { dispatch(addBuildingFloor(position)) },
    removeBuildingFloor: (position) => { dispatch(removeBuildingFloor(position)) },
    setBuildingFloorValue: (position, value) => {
      if (!value) return
      dispatch(setBuildingFloorValue(position, value))
    }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(BuildingHeightControl))
