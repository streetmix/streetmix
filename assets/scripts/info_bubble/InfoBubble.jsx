import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import RemoveButton from './RemoveButton'
import Variants from './Variants'
import WidthControl from './WidthControl'
import Warnings from './Warnings'
import { infoBubble } from './info_bubble'
import { resumeFadeoutControls } from '../segments/resizing'
import { getStreet } from '../streets/data_model'
// import { trackEvent } from '../app/event_tracking'
import { BUILDING_VARIANTS, BUILDING_VARIANT_NAMES } from '../segments/buildings'
import { SEGMENT_INFO } from '../segments/info'
import { setInfoBubbleMouseInside } from '../store/actions/infoBubble'

const INFO_BUBBLE_TYPE_SEGMENT = 1
const INFO_BUBBLE_TYPE_LEFT_BUILDING = 2
const INFO_BUBBLE_TYPE_RIGHT_BUILDING = 3

class InfoBubble extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    dataNo: PropTypes.number,
    setInfoBubbleMouseInside: PropTypes.func
  }

  static defaultProps = {
    visible: false
  }

  constructor (props) {
    super(props)

    this.state = {
      type: null,
      street: null,
      segment: null
    }
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

  // TODO: verify this continues to work with pointer / touch taps
  onMouseEnter = (event) => {
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.add('hide-drag-handles-when-inside-info-bubble')
    }

    this.props.setInfoBubbleMouseInside(true)

    infoBubble.updateHoverPolygon()
  }

  onMouseLeave = (event) => {
    // TODO: Prevent pointer taps from flashing the drag handles
    if (infoBubble.segmentEl) {
      infoBubble.segmentEl.classList.remove('hide-drag-handles-when-inside-info-bubble')
    }

    this.props.setInfoBubbleMouseInside(false)
  }

  updateInfoBubbleState = () => {
    const street = getStreet()
    this.setState({
      type: infoBubble.type,
      street,
      segment: street.segments[this.props.dataNo]
    })
  }

  getName = () => {
    let name

    switch (this.state.type) {
      case INFO_BUBBLE_TYPE_SEGMENT:
        const segment = this.state.segment
        if (segment) {
          const segmentInfo = SEGMENT_INFO[segment.type]
          const variantInfo = SEGMENT_INFO[segment.type].details[segment.variantString]
          name = variantInfo.name || segmentInfo.name
        }
        break
      case INFO_BUBBLE_TYPE_LEFT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(this.state.street.leftBuildingVariant)]
        break
      case INFO_BUBBLE_TYPE_RIGHT_BUILDING:
        name = BUILDING_VARIANT_NAMES[BUILDING_VARIANTS.indexOf(this.state.street.rightBuildingVariant)]
        break
      default:
        break
    }

    return name
  }

  render () {
    const type = this.state.type
    const canBeDeleted = (type === INFO_BUBBLE_TYPE_SEGMENT)
    const showWidth = (type === INFO_BUBBLE_TYPE_SEGMENT)
    const segmentEl = infoBubble.segmentEl
    const className = 'info-bubble' + ((this.props.visible) ? ' visible' : '')

    return (
      <div
        className={className}
        data-type={(type === INFO_BUBBLE_TYPE_SEGMENT) ? 'segment' : 'building'}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onTouchStart={this.onTouchStart}
      >
        <div className="info-bubble-triangle" />
        <header>
          {this.getName()}
          <RemoveButton enabled={canBeDeleted} segment={segmentEl} />
        </header>
        <WidthControl enabled={showWidth} segment={segmentEl} />
        <div className="non-variant building-height" />
        <Variants type={type} segment={this.state.segment} street={this.state.street} />
        <Warnings segment={this.state.segment} />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.infoBubble.visible,
    dataNo: state.infoBubble.dataNo
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setInfoBubbleMouseInside: (value) => { dispatch(setInfoBubbleMouseInside(value)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfoBubble)
