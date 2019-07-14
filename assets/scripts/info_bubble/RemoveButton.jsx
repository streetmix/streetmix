import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, injectIntl, intlShape } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { trackEvent } from '../app/event_tracking'
import { removeSegment, removeAllSegments } from '../segments/remove'
import { ICON_TRASH } from '../ui/icons'
import './RemoveButton.scss'

class RemoveButton extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    segment: PropTypes.number.isRequired
  }

  static defaultProps = {
    segment: null
  }

  onClick = (event) => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
      trackEvent('INTERACTION', 'REMOVE_ALL_SEGMENTS', 'BUTTON', null, true)
    } else {
      // Otherwise, remove one segment
      removeSegment(this.props.segment)
      trackEvent('INTERACTION', 'REMOVE_SEGMENT', 'BUTTON', null, true)
    }
  }

  render () {
    // Bail if segment is not provided; do not check for falsy. 0 is valid value for segment
    if (typeof this.props.segment === 'undefined' || this.props.segment === null) return null

    return (
      <button
        className="info-bubble-remove"
        tabIndex={-1}
        title={this.props.intl.formatMessage({ id: 'tooltip.remove-segment', defaultMessage: 'Remove segment' })}
        onClick={this.onClick}
      >
        <FontAwesomeIcon
          icon={ICON_TRASH}
          className="remove-icon"
        />
        <FormattedMessage id="btn.remove" defaultMessage="Remove" />
      </button>
    )
  }
}

export default injectIntl(RemoveButton)
