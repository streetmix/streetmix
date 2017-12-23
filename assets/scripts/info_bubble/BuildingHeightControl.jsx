import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { t } from '../app/locale'
import {
  MAX_BUILDING_HEIGHT,
  isFlooredBuilding,
  changeBuildingHeight,
  buildingHeightUpdated
} from '../segments/buildings'
import { _prettifyHeight } from './info_bubble'

import { KEYS } from '../app/keyboard_commands'
import { hideAllMenus } from '../menus/menu_controller'
import { loseAnyFocus } from '../util/focus'
import { getStreet } from '../streets/data_model'

const WIDTH_EDIT_INPUT_DELAY = 200

class BuildingHeightControl extends React.Component {
  static propTypes = {
    touch: PropTypes.bool,
    position: PropTypes.oneOf(['left', 'right']),
    variant: PropTypes.string,
    value: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.oldValue = null
    this.held = false
    this.timerId = -1
    this.inputEl = null

    this.state = {
      value: props.value,
      displayValue: ''
    }
  }

  addFloor = () => {
    changeBuildingHeight(this.props.position === 'left', true)
  }

  removeFloor = () => {
    changeBuildingHeight(this.props.position === 'left', false)
  }

  onInput = (event) => {
    this.setState({
      displayValue: event.target.value
    })

    this._heightEditInputChanged(event.target.value, false)
  }

  onClickInput = (event) => {
    const el = event.target
    this.held = true

    if (document.activeElement !== el) {
      el.select()
    }
  }

  onFocusInput = (event) => {
    const street = getStreet()
    const value = (this.props.position === 'left') ? street.leftBuildingHeight : street.rightBuildingHeight
    this.oldValue = value
    this.setState({
      value,
      displayValue: value
    })
  }

  /**
   * On blur, input shows prettified value.
   */
  onBlurInput = (event) => {
    const street = getStreet()
    const position = this.props.position

    this._heightEditInputChanged(event.target.value, true)

    const value = (position === 'left') ? street.leftBuildingHeight : street.rightBuildingHeight

    this.setState({
      value,
      displayValue: _prettifyHeight(value)
    })

    this.held = false
  }

  /* same as WidthControl */
  onMouseOverInput = (event) => {
    if (!this.held) {
      event.target.focus()
      event.target.select() // This is usually broken in React for some reason
    }
  }

  /* same as WidthControl */
  onMouseOutInput = (event) => {
    if (!this.held) {
      event.target.blur()
    }
  }

  onKeyDownInput = (event) => {
    const street = getStreet()

    switch (event.keyCode) {
      case KEYS.ENTER:
        this._heightEditInputChanged(event.target.value, true)

        // TODO: don't read height off the data again
        const value = this.props.position === 'left' ? street.leftBuildingHeight : street.rightBuildingHeight
        this.setState({
          value,
          displayValue: _prettifyHeight(value) // doesn't work?
        })

        // Apparently we need to lose focus first or we can't re-focus and select
        loseAnyFocus()
        this.inputEl.focus()
        this.inputEl.select()
        break
      case KEYS.ESC:
        this.setState({
          value: this.oldValue
        })
        this._heightEditInputChanged(event.target.value, true)
        hideAllMenus()
        loseAnyFocus()
        break
    }
  }

  /**
   * Given an input value, convert it to an integer, then make sure it is within
   * bounds for a building.
   *
   * @param {String|Number} value - input value to test
   * @returns {Number} - number of floors
   */
  ensureHeightInBounds (value) {
    let height = window.parseInt(value)

    if (!height || (height < 1)) {
      height = 1
    } else if (height > MAX_BUILDING_HEIGHT) {
      height = MAX_BUILDING_HEIGHT
    }

    return height
  }

  _heightEditInputChanged = (value, immediate) => {
    window.clearTimeout(this.timerId)
    const street = getStreet()
    const height = this.ensureHeightInBounds(value)

    if (immediate) {
      if (this.props.position === 'left') {
        street.leftBuildingHeight = height
      } else {
        street.rightBuildingHeight = height
      }
      buildingHeightUpdated()
    } else {
      this.timerId = window.setTimeout(() => {
        if (this.props.position === 'left') {
          street.leftBuildingHeight = height
        } else {
          street.rightBuildingHeight = height
        }
        buildingHeightUpdated()
      }, WIDTH_EDIT_INPUT_DELAY)
    }
  }

  render () {
    const disabled = !isFlooredBuilding(this.props.variant)

    const inputEl = (this.props.touch) ? (
      <span className="height-non-editable" />
    ) : (
      <input
        type="text"
        className="height"
        title={t('tooltip.building-height', 'Change the number of floors')}
        disabled={disabled}
        value={this.state.displayValue}
        onChange={this.onInput}
        onClick={this.onClickInput}
        onFocus={this.onFocusInput}
        onBlur={this.onBlurInput}
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
          title={t('tooltip.add-floor', 'Add floor')}
          tabIndex={-1}
          onClick={this.addFloor}
        >
          +
        </button>
        {inputEl}
        <button
          className="decrement"
          title={t('tooltip.remove-floor', 'Remove floor')}
          tabIndex={-1}
          onClick={this.removeFloor}
        >
          –
        </button>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    touch: state.system.touch
  }
}

export default connect(mapStateToProps)(BuildingHeightControl)
