import React, { type MouseEvent } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import { useDispatch } from '~/src/store/hooks'
import {
  removeSegmentAction,
  clearSegmentsAction,
} from '~/src/store/actions/street'
import Button from '~/src/ui/Button'
import Icon from '~/src/ui/Icon'
import './RemoveButton.css'

interface RemoveButtonProps {
  segment: number
}

export function RemoveButton({ segment }: RemoveButtonProps) {
  const dispatch = useDispatch()
  const intl = useIntl()

  const handleClick = (event: MouseEvent) => {
    // Prevent this “leaking” to a segment below
    event.preventDefault()

    // Power move: a shift key will remove all segments
    if (event.shiftKey) {
      dispatch(clearSegmentsAction())
    } else {
      // Otherwise, remove one segment
      dispatch(removeSegmentAction(segment))
    }
  }

  return (
    <Button
      className="popup-slice-remove"
      tabIndex={-1}
      title={intl.formatMessage({
        id: 'tooltip.remove-segment',
        defaultMessage: 'Remove segment',
      })}
      onClick={handleClick}
    >
      <Icon name="trash" className="remove-icon" />
      <FormattedMessage id="btn.remove" defaultMessage="Remove" />
    </Button>
  )
}
