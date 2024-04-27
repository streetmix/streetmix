import React, { type MouseEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { removeSegment, removeAllSegments } from '~/src/segments/remove'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import './RemoveButton.scss'

interface RemoveButtonProps {
  segment: number
}

function RemoveButton ({ segment }: RemoveButtonProps): React.ReactElement {
  const intl = useIntl()

  const handleClick = (event: MouseEvent): void => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      removeAllSegments()
    } else {
      // Otherwise, remove one segment
      removeSegment(segment)
    }
  }

  return (
    <Button
      className="info-bubble-remove"
      tabIndex={-1}
      title={intl.formatMessage({
        id: 'tooltip.remove-segment',
        defaultMessage: 'Remove segment'
      })}
      onClick={handleClick}
    >
      <Icon icon="trash" className="remove-icon" />
      <FormattedMessage id="btn.remove" defaultMessage="Remove" />
    </Button>
  )
}

export default RemoveButton
