import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import {
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  INFO_BUBBLE_TYPE_RIGHT_BUILDING
} from '../info_bubble/constants'
import { infoBubble } from '../info_bubble/info_bubble'
import { addBuildingFloor, removeBuildingFloor } from '../store/slices/street'
import { BUILDING_LEFT_POSITION, BUILDING_RIGHT_POSITION } from './constants'
import { createBuilding, BUILDINGS } from './buildings'

class Building extends React.Component {
  static propTypes = {
    // Provided by parent
    position: PropTypes.string.isRequired,
    buildingWidth: PropTypes.number,
    updatePerspective: PropTypes.func,

    // Provided by Redux store
    street: PropTypes.object,
    activeSegment: PropTypes.string,
    leftBuildingEditable: PropTypes.bool,
    rightBuildingEditable: PropTypes.bool,

    // Provided by Redux action dispatchers
    addBuildingFloor: PropTypes.func,
    removeBuildingFloor: PropTypes.func
  }

  static defaultProps = {
    leftBuildingEditable: true,
    rightBuildingEditable: true
  }

  constructor (props) {
    super(props)

    this.state = {
      variant:
        props.position === BUILDING_LEFT_POSITION
          ? 'leftBuildingVariant'
          : 'rightBuildingVariant',
      height:
        props.position === BUILDING_LEFT_POSITION
          ? 'leftBuildingHeight'
          : 'rightBuildingHeight',
      oldBuildingEnter: true,
      newBuildingEnter: false,
      switchBuildings: false,
      isEditable: true
    }
  }

  static getDerivedStateFromProps (props, state) {
    if (
      props.leftBuildingEditable === false &&
      props.position === BUILDING_LEFT_POSITION
    ) {
      return {
        isEditable: false
      }
    } else if (
      props.rightBuildingEditable === false &&
      props.position === BUILDING_RIGHT_POSITION
    ) {
      return {
        isEditable: false
      }
    } else {
      return {
        isEditable: true
      }
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { street, position, buildingWidth } = this.props
    const { variant, height } = this.state

    const lastOverflow = prevProps.street.remainingWidth < 0
    const streetOverflow = street.remainingWidth < 0

    if (
      prevProps.street[height] !== street[height] ||
      lastOverflow !== streetOverflow ||
      (street[variant] && prevProps.buildingWidth !== buildingWidth)
    ) {
      createBuilding(
        this.streetSectionBuilding,
        street[variant],
        position,
        street[height],
        streetOverflow
      )
    }

    if (
      prevProps.street[variant] &&
      prevProps.street[variant] !== street[variant]
    ) {
      if (this.shouldBuildingAnimate(prevProps.street, street)) {
        this.handleSwitchBuildings()
      } else {
        createBuilding(
          this.streetSectionBuilding,
          street[variant],
          position,
          street[height],
          streetOverflow
        )
      }
    }

    if (prevState.switchBuildings !== this.state.switchBuildings) {
      this.props.updatePerspective(this.oldStreetSectionBuilding)
      this.props.updatePerspective(this.streetSectionBuilding)
      createBuilding(
        this.streetSectionBuilding,
        street[variant],
        position,
        street[height],
        streetOverflow
      )
    }
  }

  handleBuildingMouseEnter = (event) => {
    if (!this.state.isEditable) return

    window.addEventListener('keydown', this.handleKeyDown)

    let type

    if (this.props.position === BUILDING_LEFT_POSITION) {
      type = INFO_BUBBLE_TYPE_LEFT_BUILDING
    } else if (this.props.position === BUILDING_RIGHT_POSITION) {
      type = INFO_BUBBLE_TYPE_RIGHT_BUILDING
    }

    infoBubble.considerShowing(event, this.streetSectionBuilding, type)
  }

  handleBuildingMouseLeave = (event) => {
    if (!this.state.isEditable) return

    window.removeEventListener('keydown', this.handleKeyDown)

    if (infoBubble.considerSegmentEl === this.streetSectionBuilding) {
      infoBubble.dontConsiderShowing()
    }
  }

  handleKeyDown = (event) => {
    if (!this.state.isEditable) return

    const negative = event.key === '-'

    // Plus (+) may only triggered with shift key, so also check if
    // the same physical key (Equal) is pressed
    const positive = event.key === '+' || event.code === 'Equal'

    const variant = this.props.street[this.state.variant]
    const hasFloors = BUILDINGS[variant].hasFloors

    if (negative && hasFloors) {
      this.props.removeBuildingFloor(this.props.position)
    } else if (positive && hasFloors) {
      this.props.addBuildingFloor(this.props.position)
    }

    event.preventDefault()
  }

  changeRefs = (ref, isOldBuilding) => {
    if (!this.state.switchBuildings && !isOldBuilding) return

    if (this.state.switchBuildings && isOldBuilding) {
      this.oldStreetSectionBuilding = ref
    } else {
      this.streetSectionBuilding = ref
    }
  }

  handleSwitchBuildings = () => {
    this.setState({
      switchBuildings: !this.state.switchBuildings,
      newBuildingEnter: !this.state.newBuildingEnter,
      oldBuildingEnter: !this.state.oldBuildingEnter
    })
  }

  // Animate if the only changes in street object are:
  // editCount, rightBuildingVariant (or leftBuildingVariant), updatedAt, and clientUpdatedAt
  shouldBuildingAnimate = (oldStreet, newStreet) => {
    let userUpdated = true
    for (const key in newStreet) {
      if (oldStreet[key] !== newStreet[key]) {
        userUpdated = [
          'editCount',
          this.state.variant,
          'updatedAt',
          'clientUpdatedAt'
        ].includes(key)
        if (!userUpdated) return false
      }
    }
    return userUpdated
  }

  renderBuilding = (building) => {
    const isOldBuilding = building === 'old'

    const style = {
      [this.props.position]: `-${this.props.buildingWidth}px`,
      width: this.props.buildingWidth + 'px'
    }

    const classNames = ['street-section-building']

    // Add a class name for building position
    classNames.push(`street-segment-building-${this.props.position}`)

    if (isOldBuilding && this.props.activeSegment === this.props.position) {
      classNames.push('hover')
    }

    return (
      <section
        className={classNames.join(' ')}
        ref={(ref) => {
          this.changeRefs(ref, isOldBuilding)
        }}
        onMouseEnter={this.handleBuildingMouseEnter}
        onMouseLeave={this.handleBuildingMouseLeave}
        style={style}
      >
        <div className="hover-bk" />
      </section>
    )
  }

  render () {
    const { newBuildingEnter, oldBuildingEnter } = this.state

    return (
      <>
        <CSSTransition
          key="new-building"
          in={newBuildingEnter}
          timeout={250}
          classNames="switching-in"
          onEntered={this.handleSwitchBuildings}
          unmountOnExit={true}
        >
          {this.renderBuilding('new')}
        </CSSTransition>
        <CSSTransition
          key="old-building"
          in={oldBuildingEnter}
          timeout={250}
          classNames="switching-away"
          unmountOnExit={true}
        >
          {this.renderBuilding('old')}
        </CSSTransition>
      </>
    )
  }
}

function mapStateToProps (state) {
  return {
    street: state.street,
    activeSegment:
      typeof state.ui.activeSegment === 'string'
        ? state.ui.activeSegment
        : null,
    leftBuildingEditable: state.flags.EDIT_BUILDINGS_LEFT.value,
    rightBuildingEditable: state.flags.EDIT_BUILDINGS_RIGHT.value
  }
}

const mapDispatchToProps = {
  removeBuildingFloor,
  addBuildingFloor
}

export default connect(mapStateToProps, mapDispatchToProps)(Building)
