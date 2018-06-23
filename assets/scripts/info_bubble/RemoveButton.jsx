import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { trackEvent } from '../app/event_tracking'
import { removeSegment, removeAllSegments } from '../segments/remove'

class RemoveButton extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    segment: PropTypes.number
  }

  static defaultProps = {
    segment: null
  }

  onClick = (event) => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    const { segment } = this.props

    // Bail if segment is not provided; do not check for falsy. 0 is valid value for segment
    if (segment === undefined || segment === null) return

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
      trackEvent('INTERACTION', 'REMOVE_ALL_SEGMENTS', 'BUTTON', null, true)
    } else {
      // Otherwise, remove one segment
      removeSegment(segment)
      trackEvent('INTERACTION', 'REMOVE_SEGMENT', 'BUTTON', null, true)
    }
  }

  render () {
    return (
      <button
        className="info-bubble-remove"
        tabIndex={-1}
        title={this.props.intl.formatMessage({ id: 'tooltip.remove-segment', defaultMessage: 'Remove segment' })}
        onClick={this.onClick}
      >
        <FormattedMessage id="btn.remove" defaultMessage="Remove" />
      </button>
    )
  }
}

export default injectIntl(RemoveButton)
