import React from 'react'
import { infoBubble } from './info_bubble'
import { resumeFadeoutControls } from '../segments/resizing'
import { getStreet } from '../streets/data_model'
import { msg } from '../app/messages'
import { trackEvent } from '../app/event_tracking'
import { BUILDING_VARIANTS, BUILDING_VARIANT_NAMES } from '../segments/buildings'
import { SEGMENT_INFO } from '../segments/info'
import { removeSegment, removeAllSegments } from '../segments/remove'

const INFO_BUBBLE_TYPE_SEGMENT = 1
const INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
const INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

export default class InfoBubble extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      type: null,
      street: null
    }

    this.updateInfoBubbleState = this.updateInfoBubbleState.bind(this)
    this.getName = this.getName.bind(this)
  }

  componentDidMount () {
    // This listener hides the info bubble when the mouse leaves the
    // document area. Do not normalize it to a pointerleave event
    // because it doesn't make sense for other pointer types
    document.addEventListener('mouseleave', infoBubble.hide)

    // Listen for external triggers to update contents here
    window.addEventListener('stmx:force_infobubble_update', (e) => {
      this.updateInfoBubbleState()
    })
  }

  onTouchStart (event) {
    resumeFadeoutControls()
  }

  onRemoveButtonClick (event) {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
    } else {
      // Otherwise, remove one segment
      removeSegment(infoBubble.segmentEl) // this is the reference to the actual element.
    }

    trackEvent('INTERACTION', 'REMOVE_SEGMENT', 'BUTTON', null, true)
  }

  updateInfoBubbleState () {
    this.setState({
      type: infoBubble.type,
      street: getStreet()
    })
  }

  getName () {
    const street = this.state.street
    let name

    switch (this.state.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        const segment = street.segments[parseInt(infoBubble.segmentEl.dataNo)]
        const segmentInfo = SEGMENT_INFO[segment.type]
        const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
        name = variantInfo.name || segmentInfo.name
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.leftBuildingVariant)]
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(street.rightBuildingVariant)]
        break
    }

    return name
  }

  render () {
    const type = this.state.type
    const canBeDeleted = (type === INFO_BUBBLE_TYPE_SEGMENT)
    // const showWidth = (type === INFO_BUBBLE_TYPE_SEGMENT)

    const removeButton = (canBeDeleted) ? (
      <button
        className='remove'
        tabIndex={-1}
        title={msg('TOOLTIP_REMOVE_SEGMENT')}
        onClick={this.onRemoveButtonClick}
      >
        Remove
      </button>
    ) : null

    return (
      <div
        className='info-bubble'
        data-type={(type === INFO_BUBBLE_TYPE_SEGMENT) ? 'segment' : 'building'}
        onMouseEnter={infoBubble.onMouseEnter}
        onMouseLeave={infoBubble.onMouseLeave}
        onTouchStart={this.onTouchStart}
      >
        <div className='info-bubble-triangle' />
        <header>
          {this.getName()}
          {removeButton}
        </header>
        <div id='info-bubble-transition-element' />
      </div>
    )
  }
}
