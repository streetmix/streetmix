import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createBuilding } from './buildings'
import {
  INFO_BUBBLE_TYPE_RIGHT_BUILDING,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  infoBubble
} from '../info_bubble/info_bubble'
import { resumeFadeoutControls } from './resizing'
import { KEYS } from '../app/keyboard_commands'
import { addBuildingFloor, removeBuildingFloor } from '../store/actions/street'

class Building extends React.Component {
  static propTypes = {
    position: PropTypes.string.isRequired,
    addBuildingFloor: PropTypes.func,
    removeBuildingFloor: PropTypes.func,
    street: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      variant: (props.position === 'left') ? 'leftBuildingVariant' : 'rightBuildingVariant',
      height: (props.position === 'left') ? 'leftBuildingHeight' : 'rightBuildingHeight'
    }
  }

  componentDidUpdate (prevProps) {
    const { street, position } = this.props
    const { variant, height } = this.state
    if (prevProps[height] !== street[height]) {
      createBuilding(this.streetSectionBuilding, street[variant], position, street[height], street)
    }
  }

  onBuildingMouseEnter = (event) => {
    window.addEventListener('keydown', this.handleKeyDown)
    let type
    if (this.props.position === 'left') {
      type = INFO_BUBBLE_TYPE_LEFT_BUILDING
    } else if (this.props.position === 'right') {
      type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
    }

    infoBubble.considerShowing(event, this.streetSectionBuilding, type)
    resumeFadeoutControls()
  }

  onBuildingMouseLeave = (event) => {
    window.removeEventListener('keydown', this.handleKeyDown)
    if (event.pointerType !== 'mouse') return
    infoBubble.dontConsiderShowing()
  }

  handleKeyDown = (event) => {
    const negative = (event.keyCode === KEYS.MINUS) ||
      (event.keyCode === KEYS.MINUS_ALT) ||
      (event.keyCode === KEYS.MINUS_KEYPAD)

    const positive = (event.keyCode === KEYS.EQUAL) ||
      (event.keyCode === KEYS.EQUAL_ALT) ||
      (event.keyCode === KEYS.PLUS_KEYPAD)

    if (negative) {
      this.props.removeBuildingFloor(this.props.position)
    } else if (positive) {
      this.props.addBuildingFloor(this.props.position)
    }

    event.preventDefault()
  }

  render () {
    const buildingId = 'street-section-' + this.props.position + '-building'
    return (
      <section
        id={buildingId}
        className="street-section-building"
        ref={(ref) => { this.streetSectionBuilding = ref }}
        onMouseEnter={this.onBuildingMouseEnter}
        onMouseLeave={this.onBuildingMouseLeave}
      >
        <div className="hover-bk" />
      </section>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street
  }
}

function mapDispatchToProps (dispatch) {
  return {
    removeBuildingFloor: (...args) => { dispatch(removeBuildingFloor(...args)) },
    addBuildingFloor: (...args) => { dispatch(addBuildingFloor(...args)) }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Building)
