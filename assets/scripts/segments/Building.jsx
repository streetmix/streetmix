import React from 'react'
import PropTypes from 'prop-types'
import {
  INFO_BUBBLE_TYPE_RIGHT_BUILDING,
  INFO_BUBBLE_TYPE_LEFT_BUILDING,
  infoBubble
} from '../info_bubble/info_bubble'
import { resumeFadeoutControls } from './resizing'

class Building extends React.Component {
  static propTypes = {
    position: PropTypes.string.isRequired
  }

  onBuildingMouseEnter = (event) => {
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
    if (event.pointerType !== 'mouse') return
    infoBubble.dontConsiderShowing()
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

export default Building
