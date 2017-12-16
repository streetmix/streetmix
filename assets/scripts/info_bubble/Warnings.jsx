import React from 'react'
import PropTypes from 'prop-types'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../streets/width'
import { msg } from '../app/messages'

export default class Warnings extends React.Component {
  static propTypes = {
    segment: PropTypes.object
  }

  render () {
    let segment = this.props.segment
    let warnings = false
    let outside, small, large
    const messages = []

    if (!segment) return null

    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      warnings = true
      outside = true
      messages.push(msg('WARNING_DOESNT_FIT'))
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      warnings = true
      small = true
      messages.push(msg('WARNING_NOT_WIDE_ENOUGH'))
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      warnings = true
      large = true
      messages.push(msg('WARNING_TOO_WIDE'))
    }

    if (warnings) {
      return (
        <div className="info-bubble-warnings">
          {messages.map((message) => (<p key={message}>{message}</p>))}
        </div>
      )
    }

    return null
  }
}
