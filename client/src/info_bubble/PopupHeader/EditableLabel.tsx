import React from 'react'
import { useIntl } from 'react-intl'

import Icon from '~/src/ui/Icon'
import { Tooltip } from '~/src/ui/Tooltip'
import './EditableLabel.css'

import type { SectionType } from '@streetmix/types'

interface EditableLabelProps {
  readonly label: string | React.JSX.Element
  readonly type: SectionType
  readonly isEditUnlocked: boolean
  readonly handleClickEdit: () => void
}

export function EditableLabel({
  label,
  type,
  handleClickEdit,
  isEditUnlocked,
}: EditableLabelProps) {
  const intl = useIntl()

  // Boundary labels are not currently editable, so labels are not interactive
  if (type === 'boundary') {
    return <div className="popup-label">{label}</div>
  }

  if (isEditUnlocked) {
    return (
      <div
        className="popup-label popup-label-editable"
        onClick={handleClickEdit}
      >
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
