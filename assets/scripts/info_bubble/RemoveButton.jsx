import React from 'react'
import PropTypes from 'prop-types'
import { msg } from '../app/messages'
import { t } from '../app/locale'
import { trackEvent } from '../app/event_tracking'
import { removeSegment, removeAllSegments } from '../segments/remove'

export default class RemoveButton extends React.PureComponent {
  constructor (props) {
    super(props)

    this.onClick = this.onClick.bind(this)
  }

  onClick (event) {
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
    const removeButton = (this.props.enabled) ? (
      <button
        className='remove'
        tabIndex={-1}
        title={t('tooltip.remove-segment', 'Remove segment')}
        onClick={this.onClick}
      >
        {t('btn.remove', 'Remove')}
      </button>
    ) : null

    return removeButton
  }
}

RemoveButton.propTypes = {
  enabled: PropTypes.bool,
  segment: PropTypes.object // TODO: this is the actual DOM element; change it to a value
}

RemoveButton.defaultProps = {
  enabled: true,
  segment: null
}
