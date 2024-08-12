import React from 'react'
import { useIntl } from 'react-intl'

import { useSelector } from '~/src/store/hooks'
import { editSegmentLabel } from '~/src/segments/view'
import Icon from '~/src/ui/Icon'
import Tooltip from '~/src/ui/Tooltip'
import './EditableLabel.css'

import type { BuildingPosition, Segment } from '@streetmix/types'

interface EditableLabelProps {
  // Label can be string, or React element (if translated by ReactIntl)
  label: string | React.ReactElement
  segment?: Segment
  position: number | BuildingPosition
}

function EditableLabel ({
  label,
  segment,
  position
}: EditableLabelProps): React.ReactElement {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  const handleClick = (): void => {
    if (segment !== undefined) {
      editSegmentLabel(segment, position)
    }
  }

  // If position is a string, it's a building, and buildings are currently not
  // editable at all, so render a label with no interactivity
  if (typeof position === 'string') {
    return <div className="info-bubble-label">{label}</div>
  }

  if (isSubscriber) {
    return (
      <div
        className="info-bubble-label info-bubble-label-editable"
        onClick={handleClick}
      >
        {label}
        <Icon name="edit" className="info-bubble-label-editable-icon" />
      </div>
    )
  }

  return (
    <Tooltip
      label={intl.formatMessage({
        id: 'plus.locked.sub-edit',
        defaultMessage: 'Upgrade to Streetmix+ to edit'
      })}
    >
      <div className="info-bubble-label info-bubble-label-editable">
        {label}
        <Icon name="lock" className="info-bubble-label-editable-icon" />
      </div>
    </Tooltip>
  )
}

export default EditableLabel
