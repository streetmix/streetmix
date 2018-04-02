import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
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
      height: (props.position === 'left') ? 'leftBuildingHeight' : 'rightBuildingHeight',
      switchBuildings: false
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { street, position } = this.props
    const { variant, height } = this.state
    if (prevProps.street[height] !== street[height]) {
      createBuilding(this.streetSectionBuilding, street[variant], position, street[height], street)
    }

    if (prevProps.street[variant] && prevProps.street[variant] !== street[variant]) {
      this.setState({
        switchBuildings: true
      })
    }

    if (prevState.switchBuildings !== this.state.switchBuildings) {
      this.handleBuildingSwitch()
      createBuilding(this.streetSectionBuilding, street[variant], position, street[height], street)
    }
  }

  handleBuildingSwitch = () => {
    const el = this.oldStreetSectionBuilding
    const perspective = this.props.calculateBuildingPerspective(el)

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'

    el.classList.remove('hover')
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

  handleChangeInRefs = (ref) => {
    if (this.state.switchBuildings) {
      this.oldStreetSectionBuilding = ref
    } else {
      this.streetSectionBuilding = ref
    }
  }

  switchBuildingAway = () => {
    console.log('switching out')
    const el = this.oldStreetSectionBuilding
    const style = this.props.calculateOldBuildingStyle(el)
    el.style.left = style.left 
    el.style.top = style.top
  }

  switchBuildingIn = () => {
    console.log('switching in', this.state.switchingIn)
    const el = this.streetSectionBuilding
    const perspective = this.props.calculateBuildingPerspective(el)

    el.style.webkitPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.MozPerspectiveOrigin = (perspective / 2) + 'px 50%'
    el.style.perspectiveOrigin = (perspective / 2) + 'px 50%'
  }

  render () {
    const buildingId = 'street-section-' + this.props.position + '-building'
    const style = {
      [this.props.position]: (-this.props.buildingWidth + 25) + 'px',
      width: this.props.buildingWidth + 'px'
    }

    const newBuilding = (this.state.switchBuildings) ? (
      <CSSTransition
        in={this.state.switchBuildings}
        timeout={500}
        classNames="switching-in"
        onEnter={this.switchBuildingIn}
        onEntered={() => { this.setState({ switchBuildings: false }) }}
      >
        <section
          className="street-section-building"
          ref={(ref) => { this.streetSectionBuilding = ref }}
          style={style}
        >
          <div className="hover-bk" />
        </section>
      </CSSTransition>
    ) : null

    return (
      <TransitionGroup>
        <CSSTransition
          in={!this.state.switchBuildings}
          timeout={500}
          classNames="switching-away"
          onExit={this.switchBuildingAway}
          unmountOnExit
        >
          <section
            id={buildingId}
            className="street-section-building"
            ref={(ref) => { this.handleChangeInRefs(ref) }}
            onMouseEnter={this.onBuildingMouseEnter}
            onMouseLeave={this.onBuildingMouseLeave}
            style={style}
          >
            <div className="hover-bk" />
          </section>
        </CSSTransition>
        {newBuilding}
      </TransitionGroup>
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
