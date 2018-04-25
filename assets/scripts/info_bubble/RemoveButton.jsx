import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { trackEvent } from '../app/event_tracking'
import { removeSegment, removeAllSegments } from '../segments/remove'

class RemoveButton extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    enabled: PropTypes.bool,
    segment: PropTypes.object // TODO: this is the actual DOM element; change it to a value
  }

  static defaultProps = {
    enabled: true,
    segment: null
  }

  onClick = (event) => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
    } else {
      // Otherwise, remove one segment
      removeSegment(this.props.segment) // this is the reference to the actual element.
    }

    trackEvent('INTERACTION', 'REMOVE_SEGMENT', 'BUTTON', null, true)
  }

  render () {
    if (!this.props.enabled) return null

    return (
      <button
        className="info-bubble-remove"
        tabIndex={-1}
        title={this.props.intl.formatMessage({ id: 'tooltip.remove-segment', defaultMessage: 'Remove segment' })}
        onClick={this.onClick}
      >
        <FormattedMessage id="btn.remove" defaultMessage="remove" />
      </button>
    )
  }
}

export default injectIntl(RemoveButton)
