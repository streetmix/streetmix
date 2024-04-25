import React from 'react'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { useSelector } from '../store/hooks'
import { editSegmentLabel } from '../segments/view'
import { ICON_PENCIL, ICON_LOCK } from '../ui/icons'
import Tooltip from '../ui/Tooltip'
import './EditableLabel.scss'

import type { BuildingPosition } from '@streetmix/types'

interface EditableLabelProps {
  // Label can be string, or React element (if translated by ReactIntl)
  label: string | React.ReactElement
  segment: object
  position: number | BuildingPosition
}

function EditableLabel (props: EditableLabelProps): React.ReactElement {
  const { label, segment, position } = props
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()

  const handleClick = (): void => {
    editSegmentLabel(segment, position)
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
        <span className="info-bubble-label-editable-icon">
          <FontAwesomeIcon icon={ICON_PENCIL} />
        </span>
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
        <span className="info-bubble-label-editable-icon">
          <FontAwesomeIcon icon={ICON_LOCK} />
        </span>
      </div>
    </Tooltip>
  )
}

export default EditableLabel
