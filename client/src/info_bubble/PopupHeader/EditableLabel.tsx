import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import { editSegmentLabel } from '~/src/segments/view'
import Icon from '~/src/ui/Icon'
import { Tooltip } from '~/src/ui/Tooltip'
import './EditableLabel.css'

import type { BoundaryPosition, Segment } from '@streetmix/types'

interface EditableLabelProps {
  readonly label: string | React.JSX.Element
  readonly position: number | BoundaryPosition
  readonly slice?: Segment
}

export function EditableLabel({ label, position, slice }: EditableLabelProps) {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  const handleClick = () => {
    if (slice !== undefined && typeof position === 'number') {
      editSegmentLabel(position, slice)
    }
  }

  // If position is a string, it's a building, and buildings are currently not
  // editable at all, so render a label with no interactivity
  if (typeof position === 'string') {
    return <div className="popup-label">{label}</div>
  }

  if (isSubscriber) {
    return (
      <div className="popup-label popup-label-editable" onClick={handleClick}>
        {label}
        <Icon name="edit" className="popup-label-editable-icon" />
      </div>
    )
  }

  return (
    <Tooltip
      label={intl.formatMessage({
        id: 'plus.locked.sub-edit',
        defaultMessage: 'Upgrade to Streetmix+ to edit',
      })}
    >
      <div className="popup-label popup-label-editable">
        {label}
        <Icon name="lock" className="popup-label-editable-icon" />
      </div>
    </Tooltip>
  )
}
