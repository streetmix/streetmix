import React from 'react'
import { infoBubble } from './info_bubble'
import { resumeFadeoutControls } from '../segments/resizing'

export default class InfoBubble extends React.PureComponent {
  componentDidMount () {
    // This listener hides the info bubble when the mouse leaves the
    // document area. Do not normalize it to a pointerleave event
    // because it doesn't make sense for other pointer types
    document.addEventListener('mouseleave', infoBubble.hide)
  }

  onTouchStart (event) {
    resumeFadeoutControls()
  }

  render () {
    return (
      <div
        className='info-bubble'
        onMouseEnter={infoBubble.onMouseEnter}
        onMouseLeave={infoBubble.onMouseLeave}
        onTouchStart={this.onTouchStart}
      />
    )
  }
}
