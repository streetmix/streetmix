import React from 'react'
import PropTypes from 'prop-types'
import {
  SEGMENT_WARNING_OUTSIDE,
  SEGMENT_WARNING_WIDTH_TOO_SMALL,
  SEGMENT_WARNING_WIDTH_TOO_LARGE
} from '../streets/width'
import { t } from '../app/locale'

export default class Warnings extends React.Component {
  static propTypes = {
    segment: PropTypes.object
  }

  render () {
    const segment = this.props.segment
    const messages = []

    if (!segment) return null

    if (segment.warnings[SEGMENT_WARNING_OUTSIDE]) {
      messages.push(t('segments.warnings.does-not-fit', 'This segment doesn’t fit within the street.'))
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_SMALL]) {
      messages.push(t('segments.warnings.not-wide', 'This segment might not be wide enough.'))
    }
    if (segment.warnings[SEGMENT_WARNING_WIDTH_TOO_LARGE]) {
      messages.push(t('segments.warnings.too-wide', 'This segment might be too wide.'))
    }

    if (messages.length > 0) {
      return (
        <div className="info-bubble-warnings">
          {messages.map((message) => (<p key={message}>{message}</p>))}
        </div>
      )
    }

    return null
  }
}
